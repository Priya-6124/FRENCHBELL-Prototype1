import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

// =================== 1. MOBILE OTP & AUTH ROUTES ===================

// Send OTP to 10-digit mobile number
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Mobile number is required' });

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }

    // Generate 4-digit numeric OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    otpStore.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
    });

    console.log(`📱 [SMS Gateway Simulator] OTP for +91 ${cleanPhone}: ${otp}`);

    res.json({
      success: true,
      phone: cleanPhone,
      otp, // Provided in response for easy prototype testing
      message: `OTP sent successfully to +91 ${cleanPhone}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP & Login / Register
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    const stored = otpStore.get(cleanPhone);

    // Accept either exact matching OTP or universal test OTP '1234'
    const isValid = (stored && stored.otp === String(otp).trim()) || String(otp).trim() === '1234';

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP code' });
    }

    // Clean up OTP
    otpStore.delete(cleanPhone);

    const db = await getDb();
    let user = await db.get('SELECT * FROM users WHERE phone = ?', [cleanPhone]);

    const isManagerPhone = cleanPhone === '9876543210';
    const role = isManagerPhone ? 'admin' : 'customer';
    const displayName = (name && name.trim()) || (user && user.name) || `Foodie ${cleanPhone.slice(-4)}`;

    if (!user) {
      const dummyPasswordHash = await bcrypt.hash('otp_customer_pass', 8);
      const insertRes = await db.run(`
        INSERT INTO users (name, phone, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
      `, [displayName, cleanPhone, null, dummyPasswordHash, role]);

      user = {
        id: insertRes.lastID,
        name: displayName,
        phone: cleanPhone,
        email: null,
        role
      };
    } else if (name && name.trim() && user.name !== name.trim()) {
      user.name = name.trim();
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
      message: 'Mobile verification successful!'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Passcode Direct Login
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { passcode } = req.body;
    if (passcode === 'admin123' || passcode === 'admin') {
      const adminUser = {
        id: 1,
        name: 'French Bell Operations Manager',
        phone: '9876543210',
        email: 'admin@frenchbell.com',
        role: 'admin'
      };
      const token = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: adminUser, message: 'Admin authenticated' });
    }
    return res.status(401).json({ error: 'Invalid admin passcode' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get('SELECT id, name, phone, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
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

// =================== 10. WHATSAPP RECEIPT SIMULATOR ===================
app.post('/api/receipts/whatsapp', async (req, res) => {
  try {
    const { order_number, phone } = req.body;
    const db = await getDb();
    const order = await db.get('SELECT * FROM orders WHERE order_number = ?', [order_number]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await db.run('UPDATE receipts SET whatsapp_status = "sent" WHERE order_id = ?', [order.id]);

    res.json({
      success: true,
      message: `WhatsApp receipt dispatched to ${phone || order.phone}! 📱`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`🔔 French Bell Cafe Server running on port ${PORT}`);
});
