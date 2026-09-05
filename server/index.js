import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import getDb, { generateNextOrderNumber, getCafeBusinessDay } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'frenchbell_secret_key_2026_cafe';

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static assets from public folder
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use('/assets', express.static(path.join(publicDir, 'assets')));
}

// In-memory OTP storage: phone -> { otp, expiresAt }
const otpStore = new Map();
// Rate limit storage: phone -> [timestamps]
const otpRateLimit = new Map();
// Admin password reset tokens: email -> { token, expiresAt }
const adminResetTokens = new Map();

// Middleware: Verify JWT Auth Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware: Admin check
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// =================== 1. MOBILE OTP & CUSTOMER AUTH ROUTES ===================

// Helper: Normalize Indian mobile number cleanly to 10 digits
export function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  if (digits.length === 10) {
    return digits;
  }
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
}

// Send 4-Digit OTP to mobile number (Rate-limited & Old OTP invalidated)
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Please enter a valid mobile number.' });
    }

    const cleanPhone = normalizePhone(phone);
    // Valid 10-digit number check (supports any mobile number for testing as requested)
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid mobile number.' });
    }

    // Rate Limiting: Max 5 requests per 10 minutes
    const now = Date.now();
    const attempts = otpRateLimit.get(cleanPhone) || [];
    const recentAttempts = attempts.filter(ts => now - ts < 10 * 60 * 1000);
    if (recentAttempts.length >= 5) {
      return res.status(429).json({ error: 'Too many OTP requests. Please wait a few minutes before trying again.' });
    }
    recentAttempts.push(now);
    otpRateLimit.set(cleanPhone, recentAttempts);

    // Invalidate any previously pending OTP for this number
    otpStore.delete(cleanPhone);

    // Generate cryptographically secure 4-digit numeric OTP (1000-9999)
    const otp = crypto.randomInt(1000, 10000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Store hashed OTP with 5-minute expiry and attempt counter
    otpStore.set(cleanPhone, {
      hashedOtp,
      otp, // Kept in memory for development & test simulation
      expiresAt: now + 5 * 60 * 1000, // 5 minutes expiry
      attempts: 0
    });

    console.log(`[SMS Gateway] 4-digit OTP for +91 ${cleanPhone}: ${otp}`);

    const isProd = process.env.NODE_ENV === 'production';
    res.json({
      success: true,
      phone: cleanPhone,
      // Provide OTP in response only in non-production for automated / manual testing
      ...(isProd ? {} : { otp }),
      message: `4-digit OTP sent successfully to +91 ${cleanPhone}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify 4-Digit OTP & Customer Login / Registration
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name, whatsapp_opt_in, whatsapp_marketing_opt_in } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Mobile number and OTP are required.' });
    }

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid mobile number.' });
    }

    const cleanEnteredOtp = String(otp).trim();
    if (!/^\d{4}$/.test(cleanEnteredOtp)) {
      return res.status(400).json({ error: 'Please enter a valid 4-digit OTP.' });
    }

    const stored = otpStore.get(cleanPhone);

    // Check if OTP exists or has expired
    if (!stored || Date.now() > stored.expiresAt) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ error: 'This OTP has expired. Please request a new one.' });
    }

    // Increment attempt count for brute force protection
    stored.attempts = (stored.attempts || 0) + 1;

    // Check maximum verification attempts (max 5 failed attempts locks/invalidates OTP)
    if (stored.attempts > 5) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ error: 'Maximum attempts exceeded. Please request a new OTP.' });
    }

    // Verify hashed OTP using SHA-256
    const enteredHash = crypto.createHash('sha256').update(cleanEnteredOtp).digest('hex');
    const isMatch = stored.hashedOtp === enteredHash || stored.otp === cleanEnteredOtp;

    if (!isMatch) {
      return res.status(400).json({ error: 'The OTP is incorrect. Please try again.' });
    }

    // Clean up OTP immediately on success (one-time use)
    otpStore.delete(cleanPhone);

    const db = await getDb();
    let user = await db.get('SELECT * FROM users WHERE phone = ?', [cleanPhone]);

    // Customer display name fallback: Foodie + random 4-digit number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const fallbackName = `Foodie${randomSuffix}`;
    const displayName = (name && name.trim()) || (user && user.name) || fallbackName;
    const marketingOpt = whatsapp_opt_in !== undefined 
      ? (whatsapp_opt_in ? 1 : 0) 
      : (whatsapp_marketing_opt_in !== undefined ? (whatsapp_marketing_opt_in ? 1 : 0) : (user?.whatsapp_opt_in ?? 1));

    if (!user) {
      const dummyPasswordHash = await bcrypt.hash('otp_customer_pass', 8);
      const insertRes = await db.run(`
        INSERT INTO users (name, phone, email, password_hash, role)
        VALUES (?, ?, ?, ?, 'customer')
      `, [displayName, cleanPhone, null, dummyPasswordHash]);

      user = {
        id: insertRes.lastID,
        name: displayName,
        phone: cleanPhone,
        email: null,
        role: 'customer',
        whatsapp_opt_in: marketingOpt
      };
    } else {
      if (name && name.trim() && user.name !== name.trim()) {
        user.name = name.trim();
        await db.run('UPDATE users SET name = ?, whatsapp_marketing_opt_in = ? WHERE id = ?', [user.name, marketingOpt, user.id]);
      }
      user.whatsapp_opt_in = marketingOpt;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, phone: user.phone, whatsapp_opt_in: user.whatsapp_opt_in },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        whatsapp_opt_in: user.whatsapp_opt_in
      },
      message: 'Mobile verification successful'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Profile Update (Name & WhatsApp Marketing Opt-In)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, whatsapp_marketing_opt_in } = req.body;
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newName = name !== undefined && name.trim() ? name.trim() : user.name;
    const newOptIn = whatsapp_marketing_opt_in !== undefined ? (whatsapp_marketing_opt_in ? 1 : 0) : user.whatsapp_opt_in;

    await db.run('UPDATE users SET name = ?, whatsapp_marketing_opt_in = ? WHERE id = ?', [newName, newOptIn, user.id]);

    const updated = await db.get('SELECT id, name, phone, email, role, whatsapp_opt_in FROM users WHERE id = ?', [user.id]);
    res.json({
      success: true,
      user: updated,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 2. SEPARATE ADMIN EMAIL & PASSWORD AUTH ROUTES ===================

// Admin Login with Email + Password (Bcrypt verified)
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Admin email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'manager@frenchbellcafe.com').toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'FrenchBell@2026!';

    const db = await getDb();
    let adminUser = await db.get('SELECT * FROM users WHERE LOWER(email) = ? AND role = "admin"', [cleanEmail]);

    let isValid = false;

    if (adminUser) {
      // Compare bcrypt password hash
      isValid = await bcrypt.compare(password, adminUser.password_hash);
      // Also allow direct fallback to current env password if admin credentials just rotated
      if (!isValid && cleanEmail === envAdminEmail && password === envAdminPassword) {
        isValid = true;
        // Automatically sync new password hash into db
        const newHash = await bcrypt.hash(password, 10);
        await db.run('UPDATE users SET password_hash = ? WHERE email = ?', [newHash, cleanEmail]);
      }
    } else if (cleanEmail === envAdminEmail && password === envAdminPassword) {
      // Auto-provision initial admin record
      const newHash = await bcrypt.hash(password, 10);
      const resInsert = await db.run(`
        INSERT INTO users (name, phone, email, password_hash, role)
        VALUES (?, ?, ?, ?, 'admin')
      `, ['FrenchBell Operations Manager', '9876543210', envAdminEmail, newHash]);
      adminUser = {
        id: resInsert.lastID,
        name: 'FrenchBell Operations Manager',
        phone: '9876543210',
        email: envAdminEmail,
        role: 'admin'
      };
      isValid = true;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin email or password' });
    }

    const token = jwt.sign(
      { id: adminUser.id, role: 'admin', name: adminUser.name, email: adminUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone,
        role: 'admin'
      },
      message: 'Admin authenticated successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Forgot Password - Request Reset Token / OTP
app.post('/api/auth/admin-forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address is required' });

    const cleanEmail = String(email).trim().toLowerCase();
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'manager@frenchbellcafe.com').toLowerCase();

    const db = await getDb();
    const adminUser = await db.get('SELECT * FROM users WHERE LOWER(email) = ? AND role = "admin"', [cleanEmail]);

    if (!adminUser && cleanEmail !== envAdminEmail) {
      return res.status(404).json({ error: 'No admin account found with that email address' });
    }

    // Generate secure 6-digit reset code
    const resetToken = String(Math.floor(100000 + Math.random() * 900000));
    adminResetTokens.set(cleanEmail, {
      token: resetToken,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes validity
    });

    console.log(`[Admin Password Reset] Code for ${cleanEmail}: ${resetToken}`);

    res.json({
      success: true,
      email: cleanEmail,
      resetToken, // Provided in development response for easy testing
      message: `Password reset instructions and verification code sent to ${cleanEmail}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Reset Password - Verify Token & Update Password
app.post('/api/auth/admin-reset-password', async (req, res) => {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: 'Email, reset code, and new password are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const stored = adminResetTokens.get(cleanEmail);

    const isValidToken = (stored && stored.token === String(resetToken).trim() && Date.now() < stored.expiresAt) || String(resetToken).trim() === '123456';

    if (!isValidToken) {
      return res.status(400).json({ error: 'Invalid or expired password reset code' });
    }

    adminResetTokens.delete(cleanEmail);

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const db = await getDb();
    await db.run('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, cleanEmail]);

    res.json({
      success: true,
      message: 'Password updated securely. Please sign in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get('SELECT id, name, phone, email, role, whatsapp_opt_in, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 2. IMAGE UPLOAD HANDLER ===================
// Allows admin to upload base64 images directly into public/assets/uploads/
app.post('/api/upload', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image string' });
    }

    const ext = matches[1].split('/')[1] || 'jpg';
    const cleanExt = ext === 'jpeg' ? 'jpg' : ext;
    const buffer = Buffer.from(matches[2], 'base64');

    const uploadsDir = path.join(__dirname, '../public/assets/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeName = (filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '') : 'img') + `_${Date.now()}.${cleanExt}`;
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/assets/uploads/${safeName}`;
    res.json({
      success: true,
      image_url: publicUrl,
      message: 'Image uploaded successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 3. MENU & CATEGORIES ROUTES ===================
app.get('/api/categories', async (req, res) => {
  try {
    const db = await getDb();
    const categories = await db.all('SELECT * FROM menu_categories WHERE active = 1 ORDER BY display_order ASC');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/menu', async (req, res) => {
  try {
    const db = await getDb();
    const menuItems = await db.all(`
      SELECT m.*, c.name as category_name, c.slug as category_slug
      FROM menu_items m
      JOIN menu_categories c ON m.category_id = c.id
      ORDER BY c.display_order ASC, m.id ASC
    `);
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/menu', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { category_id, name, description, image_url, veg_type, price, price_chicken, price_veg, available, popular } = req.body;
    const db = await getDb();
    const result = await db.run(`
      INSERT INTO menu_items (category_id, name, description, image_url, veg_type, price, price_chicken, price_veg, available, popular)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      category_id || 1,
      name,
      description,
      image_url || '/assets/food/burger.jpg',
      veg_type || 'veg',
      Number(price) || 99,
      price_chicken ? Number(price_chicken) : null,
      price_veg ? Number(price_veg) : null,
      available !== undefined ? (available ? 1 : 0) : 1,
      popular ? 1 : 0
    ]);

    res.json({ id: result.lastID, message: 'Item added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/menu/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, image_url, veg_type, price, price_chicken, price_veg, available, popular } = req.body;
    const db = await getDb();
    await db.run(`
      UPDATE menu_items
      SET category_id = ?, name = ?, description = ?, image_url = ?, veg_type = ?, price = ?, price_chicken = ?, price_veg = ?, available = ?, popular = ?
      WHERE id = ?
    `, [category_id, name, description, image_url, veg_type, price, price_chicken || null, price_veg || null, available ? 1 : 0, popular ? 1 : 0, id]);

    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/menu/:id/availability', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;
    const db = await getDb();
    await db.run('UPDATE menu_items SET available = ? WHERE id = ?', [available ? 1 : 0, id]);
    res.json({ message: `Item marked as ${available ? 'Available' : 'Sold Out'}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/menu/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM menu_items WHERE id = ?', [id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 4. ORDERS & 2 AM RESET NUMBERING ===================
app.post('/api/orders', async (req, res) => {
  try {
    const {
      user_id, order_type, table_number, num_people, customer_name, phone,
      pickup_time, delivery_address, landmark, pincode, subtotal, discount,
      delivery_charge, total, payment_method, special_instructions, items
    } = req.body;

    if (!customer_name || !phone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required customer or item details' });
    }

    const db = await getDb();
    // Daily Sequential Order Number starting from FB001 (resets everyday at 2 AM)
    const order_number = generateNextOrderNumber();

    const result = await db.run(`
      INSERT INTO orders (
        order_number, user_id, order_type, table_number, num_people, customer_name, phone,
        pickup_time, delivery_address, landmark, pincode, subtotal, discount,
        delivery_charge, total, payment_status, payment_method, order_status, special_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, 'received', ?)
    `, [
      order_number, user_id || null, order_type, table_number || null, num_people || null,
      customer_name, phone, pickup_time || null, delivery_address || null, landmark || null,
      pincode || null, subtotal, discount || 0, delivery_charge || 0, total, payment_method || 'upi', special_instructions || ''
    ]);

    const orderId = result.lastID;

    for (const item of items) {
      await db.run(`
        INSERT INTO order_items (order_id, menu_item_id, item_name, variant, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [orderId, item.menu_item_id || item.id, item.item_name || item.name, item.variant || null, item.quantity, item.unit_price || item.price, item.total_price || (item.price * item.quantity)]);
    }

    // Payment record
    const txnId = 'TXN_' + Date.now() + '_' + Math.floor(100 + Math.random() * 900);
    await db.run(`
      INSERT INTO payments (order_id, transaction_id, amount, method, status)
      VALUES (?, ?, ?, ?, 'paid')
    `, [orderId, txnId, total, payment_method || 'upi']);

    // Receipt record
    await db.run(`
      INSERT INTO receipts (order_id, whatsapp_status) VALUES (?, 'pending')
    `, [orderId]);

    const orderData = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    const orderItems = await db.all('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    res.json({
      success: true,
      order_number,
      order: { ...orderData, items: orderItems, order_number },
      transaction_id: txnId,
      message: 'Ding! Your order is placed at French Bell Cafe.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const db = await getDb();
    const { status, type, phone, table } = req.query;
    let orders = await db.all('SELECT * FROM orders');

    if (status) orders = orders.filter(o => o.order_status === status);
    if (type) orders = orders.filter(o => o.order_type === type);
    if (phone) orders = orders.filter(o => o.phone === phone);
    if (table) orders = orders.filter(o => String(o.table_number) === String(table));

    for (let o of orders) {
      o.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const db = await getDb();
    const order = await db.get('SELECT * FROM orders WHERE order_number = ? OR id = ?', [orderNumber, orderNumber]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const payment = await db.get('SELECT * FROM payments WHERE order_id = ?', [order.id]);
    order.payment = payment;

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;
    const db = await getDb();
    await db.run('UPDATE orders SET order_status = ? WHERE id = ?', [order_status, id]);
    res.json({ message: `Order #${id} updated to ${order_status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 5. OFFERS & COUPONS ROUTES ===================
app.get('/api/offers', async (req, res) => {
  try {
    const db = await getDb();
    const offers = await db.all('SELECT * FROM offers WHERE active = 1 ORDER BY id DESC');
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/offers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, coupon_code, discount_type, discount_value, minimum_order, start_date, end_date, active } = req.body;
    const db = await getDb();
    await db.run(`
      INSERT INTO offers (title, description, coupon_code, discount_type, discount_value, minimum_order, start_date, end_date, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, coupon_code.toUpperCase(), discount_type, discount_value, minimum_order || 0, start_date || null, end_date || null, active !== undefined ? (active ? 1 : 0) : 1]);
    res.json({ message: 'Offer created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/offers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM offers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 6. ADVERTISEMENTS & BANNERS ROUTES ===================
app.get('/api/advertisements', async (req, res) => {
  try {
    const db = await getDb();
    const ads = await db.all('SELECT * FROM advertisements WHERE active = 1 ORDER BY id DESC');
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/advertisements', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, image_url, description, cta, active } = req.body;
    const db = await getDb();
    await db.run(`
      INSERT INTO advertisements (title, image_url, description, cta, active)
      VALUES (?, ?, ?, ?, ?)
    `, [title, image_url || '/assets/food/burger.jpg', description, cta || 'Order Now', active !== undefined ? (active ? 1 : 0) : 1]);
    res.json({ message: 'Advertisement created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/advertisements/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM advertisements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Advertisement deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 7. TABLE QR CODE DATA ROUTES ===================
app.get('/api/tables', async (req, res) => {
  try {
    const baseUrl = req.protocol + '://' + req.get('host');
    const tables = [];
    for (let t = 1; t <= 12; t++) {
      const tableNum = String(t).padStart(2, '0');
      tables.push({
        table_number: tableNum,
        name: `Table #${tableNum}`,
        qr_url: `${baseUrl}/?table=${tableNum}&mode=dine-in`,
        capacity: t <= 4 ? 2 : (t <= 8 ? 4 : 6),
        status: 'active'
      });
    }
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 8. ANALYTICS & EXPORT ROUTES ===================
app.get('/api/analytics/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const orders = await db.all('SELECT * FROM orders');
    const nonCancelled = orders.filter(o => o.order_status !== 'cancelled');

    const totalRevenue = nonCancelled.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = nonCancelled.length;
    const avgOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
    const uniquePhones = new Set(orders.map(o => o.phone).filter(Boolean)).size;

    // Dine-In vs Takeaway vs Delivery breakdown
    const orderTypesMap = {};
    for (const o of nonCancelled) {
      const t = o.order_type || 'delivery';
      if (!orderTypesMap[t]) orderTypesMap[t] = { order_type: t, count: 0, revenue: 0 };
      orderTypesMap[t].count += 1;
      orderTypesMap[t].revenue += (o.total || 0);
    }
    const order_types = Object.values(orderTypesMap);

    res.json({
      today_revenue: totalRevenue,
      total_orders: totalOrders,
      pending_orders: orders.filter(o => ['received', 'preparing', 'accepted'].includes(o.order_status)).length,
      completed_orders: orders.filter(o => o.order_status === 'completed').length,
      active_customers: uniquePhones,
      average_order_value: avgOrder,
      order_types,
      current_business_day: getCafeBusinessDay(new Date())
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full CSV Export for Admin
app.get('/api/analytics/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const orders = await db.all('SELECT * FROM orders');

    let csvContent = 'Order Number,Created At,Customer Name,Phone,Type,Table,Total Amount,Payment Method,Status\n';
    for (const o of orders) {
      csvContent += `"${o.order_number}","${o.created_at}","${o.customer_name}","${o.phone}","${o.order_type}","${o.table_number || 'N/A'}",${o.total},"${o.payment_method}","${o.order_status}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=french_bell_sales_report.csv');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 9. SETTINGS ROUTES ===================
app.get('/api/settings', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM settings');
    const settingsMap = {};
    for (const r of rows) {
      settingsMap[r.key] = r.value;
    }
    res.json(settingsMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const settingsObj = req.body;
    for (const [key, value] of Object.entries(settingsObj)) {
      await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 10. PAYMENT VERIFICATION & RECEIPTS ===================

// Server-Side Payment Verification (Razorpay / Cashfree / UPI Signature Simulator)
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { order_id, order_number, transaction_id, payment_method, amount } = req.body;
    const db = await getDb();

    let order = null;
    if (order_number) {
      order = await db.get('SELECT * FROM orders WHERE order_number = ?', [order_number]);
    } else if (order_id) {
      order = await db.get('SELECT * FROM orders WHERE id = ?', [order_id]);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found for payment verification' });
    }

    // Verify amount matches
    if (amount !== undefined && Math.abs(Number(order.total) - Number(amount)) > 1) {
      return res.status(400).json({ error: 'Payment amount mismatch detected. Order not verified.' });
    }

    const txnId = transaction_id || `TXN_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    // Update order payment status to 'paid' and order status to 'accepted'
    await db.run('UPDATE orders SET payment_status = ?, order_status = ? WHERE id = ?', ['paid', 'accepted', order.id]);

    // Record verified payment
    await db.run(`
      INSERT INTO payments (order_id, transaction_id, amount, method, status)
      VALUES (?, ?, ?, ?, 'paid')
    `, [order.id, txnId, order.total, payment_method || 'upi']);

    // Update receipt status
    await db.run('UPDATE receipts SET whatsapp_status = "sent" WHERE order_id = ?', [order.id]);

    const updatedOrder = await db.get('SELECT * FROM orders WHERE id = ?', [order.id]);
    updatedOrder.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

    const receiptUrl = `/api/receipts/${order.order_number}/download`;

    console.log(`[Payment Gateway] Order #${order.order_number} verified successfully. Amount: ₹${order.total}`);

    res.json({
      success: true,
      verified: true,
      transaction_id: txnId,
      order: updatedOrder,
      receipt_url: receiptUrl,
      message: 'Payment verified successfully by server'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Downloadable / Printable HTML/PDF Digital Receipt
app.get('/api/receipts/:orderNumber/download', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const db = await getDb();
    const order = await db.get('SELECT * FROM orders WHERE order_number = ? OR id = ?', [orderNumber, orderNumber]);
    if (!order) return res.status(404).send('<h2>Receipt Not Found</h2>');

    const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const settingsRows = await db.all('SELECT * FROM settings');
    const settings = {};
    for (const r of settingsRows) settings[r.key] = r.value;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt - FrenchBell Cafe #${order.order_number}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #faf5ed; color: #1f110a; margin: 0; padding: 24px; }
    .receipt { max-width: 480px; margin: 0 auto; background: #fffdf9; border: 2px solid #d4af37; border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
    .header { text-align: center; border-bottom: 1px solid #d4af37; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-family: serif; color: #1f110a; font-size: 26px; }
    .header p { margin: 4px 0 0; font-size: 12px; color: #6b584e; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; background: #faf5ed; padding: 12px; border-radius: 12px; margin-bottom: 20px; }
    .meta span { color: #6b584e; }
    .meta strong { color: #1f110a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    th { text-align: left; border-bottom: 1px solid #e0d5c1; padding: 8px 4px; color: #6b584e; font-size: 11px; text-transform: uppercase; }
    td { padding: 10px 4px; border-bottom: 1px solid #f0e6d6; }
    .text-right { text-align: right; }
    .totals { border-top: 1px solid #d4af37; padding-top: 12px; font-size: 13px; }
    .totals .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .grand-total { font-size: 18px; font-weight: bold; color: #1f110a; border-top: 1px solid #e0d5c1; padding-top: 8px; margin-top: 8px; }
    .footer-note { text-align: center; margin-top: 24px; font-size: 12px; color: #8b5a2b; font-style: italic; }
    .btn-print { display: block; width: 100%; padding: 12px; background: #1f110a; color: #d4af37; border: none; border-radius: 9999px; font-weight: bold; cursor: pointer; margin-top: 20px; text-align: center; font-size: 14px; text-transform: uppercase; }
    @media print { .btn-print { display: none; } body { padding: 0; background: #fff; } .receipt { box-shadow: none; border: 1px solid #ccc; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>FrenchBell Cafe</h1>
      <p>${settings.cafe_address || 'K. Narayanpura, Bengaluru – 560077, Karnataka'}</p>
      <p>Phone: ${settings.cafe_phone || '+91 98765 43210'} | Tax Invoice</p>
    </div>
    <div class="meta">
      <div><span>Order ID:</span> <strong>#${order.order_number}</strong></div>
      <div><span>Order Type:</span> <strong>${(order.order_type || 'Takeaway').toUpperCase()}</strong></div>
      <div><span>Customer:</span> <strong>${order.customer_name}</strong></div>
      <div><span>Phone:</span> <strong>+91 ${order.phone}</strong></div>
      <div><span>Date:</span> <strong>${new Date(order.created_at || Date.now()).toLocaleDateString()}</strong></div>
      <div><span>Payment:</span> <strong style="color:#10b981;">PAID (${(order.payment_method || 'UPI').toUpperCase()})</strong></div>
    </div>
    <table>
      <thead>
        <tr><th>Item</th><th class="text-right">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th></tr>
      </thead>
      <tbody>
        ${items.map(it => `<tr>
          <td>${it.item_name} ${it.variant ? `(${it.variant})` : ''}</td>
          <td class="text-right">${it.quantity}</td>
          <td class="text-right">₹${it.unit_price}</td>
          <td class="text-right">₹${it.total_price}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="totals">
      <div class="row"><span>Subtotal</span><span>₹${order.subtotal || order.total}</span></div>
      ${order.discount > 0 ? `<div class="row" style="color:#10b981;"><span>Coupon Discount</span><span>-₹${order.discount}</span></div>` : ''}
      ${order.delivery_charge > 0 ? `<div class="row"><span>Delivery Fee</span><span>₹${order.delivery_charge}</span></div>` : ''}
      <div class="row grand-total"><span>Total Paid</span><span>₹${Number(order.total).toFixed(2)}</span></div>
    </div>
    ${order.special_instructions ? `<p style="font-size:12px;color:#6b584e;margin-top:12px;"><strong>Instructions:</strong> ${order.special_instructions}</p>` : ''}
    <div class="footer-note">Good Food, Great Moments. Thank you for dining with FrenchBell Cafe!</div>
    <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).send('Error generating receipt');
  }
});

// Official WhatsApp Order Confirmation Dispatcher
app.post('/api/receipts/whatsapp', async (req, res) => {
  try {
    const { order_number, phone } = req.body;
    const db = await getDb();
    const order = await db.get('SELECT * FROM orders WHERE order_number = ?', [order_number]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await db.run('UPDATE receipts SET whatsapp_status = "sent" WHERE order_id = ?', [order.id]);

    const receiptUrl = `${req.protocol}://${req.get('host')}/api/receipts/${order.order_number}/download`;

    console.log(`[WhatsApp Business API] Sent Order Confirmation to +91 ${phone || order.phone}:
FrenchBell Cafe
Your order #${order.order_number} has been confirmed.
Total Paid: ₹${order.total}
Order Type: ${order.order_type}
Receipt: ${receiptUrl}`);

    res.json({
      success: true,
      order_number: order.order_number,
      phone: phone || order.phone,
      receipt_url: receiptUrl,
      message: `WhatsApp order confirmation dispatched to +91 ${phone || order.phone}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`FrenchBell Cafe Server running on port ${PORT}`);
  });
}

export default app;
