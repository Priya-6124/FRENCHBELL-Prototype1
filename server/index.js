import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getDb from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'frenchbell_secret_key_2026_cafe';

app.use(cors());
app.use(express.json());

// Serve static assets from public folder if exists
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use('/assets', express.static(path.join(publicDir, 'assets')));
}

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

// =================== 1. AUTH ROUTES ===================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone and password are required' });
    }

    const db = await getDb();
    const existing = await db.get('SELECT * FROM users WHERE phone = ?', [phone]);
    if (existing) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.run(`
      INSERT INTO users (name, phone, email, password_hash, role)
      VALUES (?, ?, ?, ?, 'customer')
    `, [name, phone, email || null, password_hash]);

    const user = { id: result.lastID, name, phone, email, role: 'customer' };
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user, message: 'Registration successful!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE phone = ? OR email = ?', [phone, phone]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    const userInfo = { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role };

    res.json({ token, user: userInfo, message: 'Login successful!' });
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

// =================== 2. MENU & CATEGORIES ROUTES ===================
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
    `, [category_id, name, description, image_url, veg_type || 'veg', price, price_chicken || null, price_veg || null, available ? 1 : 0, popular ? 1 : 0]);

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

// =================== 3. ORDERS ROUTES ===================
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
    const order_number = 'FB' + Math.floor(100000 + Math.random() * 900000);

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
      `, [orderId, item.menu_item_id, item.item_name, item.variant || null, item.quantity, item.unit_price, item.total_price]);
    }

    // Payment record
    const txnId = 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
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
      order: { ...orderData, items: orderItems },
      transaction_id: txnId,
      message: 'Ding! Your order is in.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const db = await getDb();
    const { status, type, phone } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND order_status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND order_type = ?';
      params.push(type);
    }
    if (phone) {
      query += ' AND phone = ?';
      params.push(phone);
    }

    query += ' ORDER BY created_at DESC';
    const orders = await db.all(query, params);

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

// =================== 4. OFFERS ROUTES ===================
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
    `, [title, description, coupon_code, discount_type, discount_value, minimum_order || 0, start_date || null, end_date || null, active ? 1 : 0]);
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

// =================== 5. ADVERTISEMENTS ROUTES ===================
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
    `, [title, image_url, description, cta, active ? 1 : 0]);
    res.json({ message: 'Advertisement created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 6. ANALYTICS ROUTES ===================
app.get('/api/analytics/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const totalOrdersRes = await db.get('SELECT COUNT(*) as count, SUM(total) as revenue, AVG(total) as avg_order FROM orders WHERE order_status != "cancelled"');
    const pendingOrdersRes = await db.get('SELECT COUNT(*) as count FROM orders WHERE order_status IN ("received", "preparing", "accepted")');
    const completedOrdersRes = await db.get('SELECT COUNT(*) as count FROM orders WHERE order_status = "completed"');
    const activeCustomersRes = await db.get('SELECT COUNT(DISTINCT phone) as count FROM orders');

    // Dine-In vs Takeaway vs Delivery breakdown
    const orderTypesRes = await db.all('SELECT order_type, COUNT(*) as count, SUM(total) as revenue FROM orders GROUP BY order_type');

    // Top Selling Items
    const topItemsRes = await db.all(`
      SELECT item_name, SUM(quantity) as total_qty, SUM(total_price) as total_sales
      FROM order_items
      GROUP BY item_name
      ORDER BY total_qty DESC
      LIMIT 5
    `);

    res.json({
      today_revenue: totalOrdersRes.revenue || 0,
      total_orders: totalOrdersRes.count || 0,
      pending_orders: pendingOrdersRes.count || 0,
      completed_orders: completedOrdersRes.count || 0,
      active_customers: activeCustomersRes.count || 0,
      average_order_value: Math.round(totalOrdersRes.avg_order || 0),
      order_types: orderTypesRes,
      top_items: topItemsRes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== 7. SETTINGS ROUTES ===================
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

// =================== 8. WHATSAPP RECEIPT SIMULATOR ===================
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
  const db = await getDb();
  console.log(`🔔 French Bell Cafe Server running on port ${PORT}`);
});
