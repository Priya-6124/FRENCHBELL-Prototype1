import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbJsonPath = path.join(__dirname, 'frenchbell_db.json');
const tmpDbPath = path.join('/tmp', 'frenchbell_db.json');

// In-Memory & Persisted Pure JS Database Store for instant zero-dependency execution
let dbData = {
  users: [],
  menu_categories: [],
  menu_items: [],
  orders: [],
  order_items: [],
  payments: [],
  offers: [],
  advertisements: [],
  notifications: [],
  receipts: [],
  settings: [],
  inventory: [],
  admin_invitations: [],
  admin_password_resets: [],
  activity_logs: [],
  admin_notifications: [],
  tables: []
};

export function getCafeBusinessDay(date = new Date()) {
  const d = new Date(date);
  // Cutoff at 2:00 AM (02:00). Orders between 00:00 and 01:59 belong to the previous day's shift!
  if (d.getHours() < 2) {
    d.setDate(d.getDate() - 1);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateNextOrderNumber() {
  loadStore();
  const currentBusinessDay = getCafeBusinessDay(new Date());
  
  // Count how many orders belong to current business day
  const ordersToday = (dbData.orders || []).filter(o => {
    const oDay = getCafeBusinessDay(new Date(o.created_at || Date.now()));
    return oDay === currentBusinessDay;
  });

  const nextSeq = ordersToday.length + 1;
  return `FB${String(nextSeq).padStart(3, '0')}`;
}

function loadStore() {
  let loaded = false;
  if ((process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) && fs.existsSync(tmpDbPath)) {
    try {
      const raw = fs.readFileSync(tmpDbPath, 'utf8');
      dbData = { ...dbData, ...JSON.parse(raw) };
      loaded = true;
    } catch (e) {}
  }

  if (!loaded && fs.existsSync(dbJsonPath)) {
    try {
      const raw = fs.readFileSync(dbJsonPath, 'utf8');
      dbData = { ...dbData, ...JSON.parse(raw) };
    } catch (e) {}
  }

  // Ensure collections exist
  if (!dbData.admin_invitations) dbData.admin_invitations = [];
  if (!dbData.admin_password_resets) dbData.admin_password_resets = [];
  if (!dbData.activity_logs) dbData.activity_logs = [];
  if (!dbData.admin_notifications) dbData.admin_notifications = [];
  if (!dbData.tables) dbData.tables = [];
}

function saveStore() {
  try {
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      fs.writeFileSync(tmpDbPath, JSON.stringify(dbData, null, 2), 'utf8');
    } else {
      fs.writeFileSync(dbJsonPath, JSON.stringify(dbData, null, 2), 'utf8');
    }
  } catch (e) {
    try {
      fs.writeFileSync(tmpDbPath, JSON.stringify(dbData, null, 2), 'utf8');
    } catch (e2) {}
  }
}

loadStore();

// Valid Status Transitions map for strict order workflow enforcement
export const VALID_ORDER_STATUS_TRANSITIONS = {
  new: ['accepted', 'preparing', 'cancelled'],
  received: ['accepted', 'preparing', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['out_for_delivery', 'completed', 'cancelled'],
  out_for_delivery: ['completed', 'cancelled'],
  completed: [], // Terminal state
  cancelled: []  // Terminal state
};

export function canTransitionOrderStatus(currentStatus, newStatus, isDelivery = false) {
  if (currentStatus === newStatus) return true;
  const normalizedCurrent = (currentStatus || 'received').toLowerCase();
  const normalizedNew = (newStatus || '').toLowerCase();

  const allowed = VALID_ORDER_STATUS_TRANSITIONS[normalizedCurrent] || [];
  return allowed.includes(normalizedNew);
}

class PureDb {
  // Direct store access helper
  getStore() {
    loadStore();
    return dbData;
  }

  save() {
    saveStore();
  }

  async exec(sql) {
    saveStore();
    return true;
  }

  // Activity Log helper
  async logActivity({ adminId, adminEmail, adminName, action, entity, entityId, details }) {
    loadStore();
    const id = dbData.activity_logs.length ? Math.max(...dbData.activity_logs.map(l => l.id || 0)) + 1 : 1;
    const entry = {
      id,
      admin_id: adminId || null,
      admin_email: adminEmail || 'system@frenchbellcafe.com',
      adminName: adminName || 'Admin',
      admin_name: adminName || 'Admin',
      action,
      entity,
      entity_id: entityId || null,
      details: details || '',
      created_at: new Date().toISOString()
    };
    dbData.activity_logs.unshift(entry);
    saveStore();
    return entry;
  }

  // Admin Notification helper
  async addAdminNotification({ title, message, type = 'info', linkTab = 'live-orders' }) {
    loadStore();
    const id = dbData.admin_notifications.length ? Math.max(...dbData.admin_notifications.map(n => n.id || 0)) + 1 : 1;
    const notification = {
      id,
      title,
      message,
      type,
      link_tab: linkTab,
      read: 0,
      created_at: new Date().toISOString()
    };
    dbData.admin_notifications.unshift(notification);
    saveStore();
    return notification;
  }

  // Check last active admin count
  getActiveAdminCount() {
    loadStore();
    return dbData.users.filter(u => u.role === 'admin' && (u.status === 'active' || !u.status)).length;
  }

  // Decrement stock and toggle out of stock if stock reaches 0
  decrementStockForOrderItem(menuItemId, qty) {
    loadStore();
    const item = dbData.menu_items.find(m => m.id == menuItemId);
    if (!item) return;

    if (item.stock_quantity === undefined || item.stock_quantity === null) {
      item.stock_quantity = 20;
    }

    item.stock_quantity = Math.max(0, Number(item.stock_quantity) - Number(qty));
    if (item.stock_quantity <= 0) {
      item.stock_quantity = 0;
      item.available = 0;
      this.addAdminNotification({
        title: 'Stock Alert: Out of Stock',
        message: `"${item.name}" has reached 0 stock and is now marked OUT OF STOCK / Currently Unavailable.`,
        type: 'warning',
        linkTab: 'menu-availability'
      });
      this.logActivity({
        adminEmail: 'inventory@frenchbellcafe.com',
        adminName: 'Inventory Bot',
        action: 'Out of Stock Auto-Trigger',
        entity: 'menu_item',
        entityId: item.id,
        details: `"${item.name}" depleted to 0 units. Marked Unavailable.`
      });
    } else if (item.stock_quantity <= 5) {
      this.addAdminNotification({
        title: 'Low Stock Alert',
        message: `"${item.name}" is running low (${item.stock_quantity} left in stock).`,
        type: 'warning',
        linkTab: 'menu-availability'
      });
    }
    saveStore();
  }

  async run(sql, params = []) {
    loadStore();
    const sqlUpper = sql.trim().toUpperCase();

    if (sqlUpper.startsWith('INSERT INTO USERS')) {
      const [name, phone, email, password_hash, role, status] = params;
      const id = dbData.users.length ? Math.max(...dbData.users.map(u => u.id || 0)) + 1 : 1;
      const user = {
        id,
        name,
        phone: phone || null,
        email: email ? email.toLowerCase() : null,
        password_hash,
        role: role || 'customer',
        status: status || 'active',
        whatsapp_opt_in: 1,
        created_at: new Date().toISOString()
      };
      dbData.users.push(user);
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('UPDATE USERS SET STATUS')) {
      const [status, id] = params;
      const u = dbData.users.find(user => user.id == id);
      if (u) {
        u.status = status;
        saveStore();
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    if (sqlUpper.startsWith('DELETE FROM USERS')) {
      const [id] = params;
      dbData.users = dbData.users.filter(u => u.id != id);
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('INSERT INTO MENU_CATEGORIES')) {
      const [id, name, slug, display_order, active] = params;
      const finalId = id || (dbData.menu_categories.length ? Math.max(...dbData.menu_categories.map(c => c.id || 0)) + 1 : 1);
      dbData.menu_categories.push({ id: finalId, name, slug, display_order: Number(display_order || 0), active: active !== undefined ? (active ? 1 : 0) : 1 });
      saveStore();
      return { lastID: finalId };
    }

    if (sqlUpper.startsWith('UPDATE MENU_CATEGORIES')) {
      const [name, slug, display_order, active, id] = params;
      const cat = dbData.menu_categories.find(c => c.id == id);
      if (cat) {
        if (name) cat.name = name;
        if (slug) cat.slug = slug;
        if (display_order !== undefined) cat.display_order = Number(display_order);
        if (active !== undefined) cat.active = active ? 1 : 0;
        saveStore();
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    if (sqlUpper.startsWith('DELETE FROM MENU_CATEGORIES')) {
      const [id] = params;
      dbData.menu_categories = dbData.menu_categories.filter(c => c.id != id);
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('INSERT INTO MENU_ITEMS')) {
      const [category_id, name, description, image_url, veg_type, price, available, popular, stock_quantity, prep_time_mins, is_special, is_recommended] = params;
      const id = dbData.menu_items.length ? Math.max(...dbData.menu_items.map(m => m.id || 0)) + 1 : 1;
      const item = {
        id,
        category_id,
        name,
        description,
        image_url,
        veg_type: veg_type || 'veg',
        price: Number(price) || 0,
        available: available !== undefined ? (available ? 1 : 0) : 1,
        popular: popular ? 1 : 0,
        stock_quantity: stock_quantity !== undefined ? Number(stock_quantity) : 20,
        prep_time_mins: prep_time_mins ? Number(prep_time_mins) : 12,
        is_special: is_special ? 1 : 0,
        is_recommended: is_recommended ? 1 : 0,
        created_at: new Date().toISOString()
      };
      dbData.menu_items.push(item);
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('UPDATE MENU_ITEMS SET AVAILABLE')) {
      const [available, id] = params;
      const item = dbData.menu_items.find(m => m.id == id);
      if (item) item.available = available ? 1 : 0;
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('UPDATE MENU_ITEMS SET STOCK_QUANTITY')) {
      const [stock_quantity, id] = params;
      const item = dbData.menu_items.find(m => m.id == id);
      if (item) {
        item.stock_quantity = Number(stock_quantity);
        if (item.stock_quantity <= 0) item.available = 0;
        saveStore();
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    if (sqlUpper.startsWith('UPDATE MENU_ITEMS')) {
      const [category_id, name, description, image_url, veg_type, price, available, popular, stock_quantity, prep_time_mins, is_special, is_recommended, id] = params;
      const item = dbData.menu_items.find(m => m.id == id);
      if (item) {
        Object.assign(item, {
          category_id,
          name,
          description,
          image_url,
          veg_type,
          price: Number(price),
          available: available ? 1 : 0,
          popular: popular ? 1 : 0,
          stock_quantity: stock_quantity !== undefined ? Number(stock_quantity) : item.stock_quantity,
          prep_time_mins: prep_time_mins !== undefined ? Number(prep_time_mins) : item.prep_time_mins,
          is_special: is_special ? 1 : 0,
          is_recommended: is_recommended ? 1 : 0
        });
        if (item.stock_quantity <= 0) item.available = 0;
      }
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('DELETE FROM MENU_ITEMS')) {
      const [id] = params;
      dbData.menu_items = dbData.menu_items.filter(m => m.id != id);
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('INSERT INTO ORDERS')) {
      const [
        order_number, user_id, order_type, table_number, num_people, customer_name, phone,
        pickup_time, delivery_address, landmark, pincode, subtotal, discount,
        delivery_charge, total, payment_status, payment_method, order_status, special_instructions
      ] = params;

      const id = dbData.orders.length ? Math.max(...dbData.orders.map(o => o.id || 0)) + 1 : 1;
      const finalOrderNumber = order_number || generateNextOrderNumber();
      const order = {
        id,
        order_number: finalOrderNumber,
        user_id,
        order_type,
        table_number,
        num_people,
        customer_name,
        phone,
        pickup_time,
        delivery_address,
        landmark,
        pincode,
        subtotal: Number(subtotal) || 0,
        discount: Number(discount) || 0,
        delivery_charge: Number(delivery_charge) || 0,
        total: Number(total) || 0,
        payment_status: payment_status || 'paid',
        payment_method: payment_method || 'upi',
        order_status: order_status || 'received',
        special_instructions,
        created_at: new Date().toISOString()
      };
      dbData.orders.push(order);
      saveStore();
      return { lastID: id, order_number: finalOrderNumber };
    }

    if (sqlUpper.startsWith('INSERT INTO ORDER_ITEMS')) {
      const [order_id, menu_item_id, item_name, variant, quantity, unit_price, total_price] = params;
      const id = dbData.order_items.length ? Math.max(...dbData.order_items.map(o => o.id || 0)) + 1 : 1;
      dbData.order_items.push({ id, order_id, menu_item_id, item_name, variant, quantity, unit_price, total_price });
      // Decrement stock automatically
      if (menu_item_id) {
        this.decrementStockForOrderItem(menu_item_id, quantity);
      }
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('UPDATE ORDERS SET ORDER_STATUS')) {
      const [order_status, id] = params;
      const o = dbData.orders.find(ord => ord.id == id || ord.order_number == id);
      if (o) {
        o.order_status = order_status;
        saveStore();
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    if (sqlUpper.startsWith('INSERT INTO OFFERS')) {
      const [title, description, coupon_code, discount_type, discount_value, minimum_order, max_discount, valid_from, valid_until, applicable_order_type, usage_limit, per_customer_limit, active] = params;
      const id = dbData.offers.length ? Math.max(...dbData.offers.map(o => o.id || 0)) + 1 : 1;
      dbData.offers.push({
        id,
        title,
        description,
        coupon_code: (coupon_code || '').toUpperCase(),
        discount_type,
        discount_value: Number(discount_value) || 0,
        minimum_order: Number(minimum_order) || 0,
        max_discount: max_discount ? Number(max_discount) : null,
        valid_from: valid_from || null,
        valid_until: valid_until || null,
        applicable_order_type: applicable_order_type || 'all',
        usage_limit: usage_limit ? Number(usage_limit) : null,
        per_customer_limit: per_customer_limit ? Number(per_customer_limit) : 1,
        times_used: 0,
        active: active !== undefined ? (active ? 1 : 0) : 1
      });
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('DELETE FROM OFFERS')) {
      const [id] = params;
      dbData.offers = dbData.offers.filter(o => o.id != id);
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('INSERT INTO ADVERTISEMENTS')) {
      const [title, image_url, description, cta, start_date, end_date, active] = params;
      const id = dbData.advertisements.length ? Math.max(...dbData.advertisements.map(a => a.id || 0)) + 1 : 1;
      dbData.advertisements.push({
        id,
        title,
        image_url: image_url || '/assets/food/burger.jpg',
        description,
        cta: cta || 'Order Now',
        start_date: start_date || null,
        end_date: end_date || null,
        active: active !== undefined ? (active ? 1 : 0) : 1
      });
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('DELETE FROM ADVERTISEMENTS')) {
      const [id] = params;
      dbData.advertisements = dbData.advertisements.filter(a => a.id != id);
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('INSERT INTO INVENTORY')) {
      const [name, category, unit, current_stock, min_threshold, cost_per_unit, supplier, linked_dishes] = params;
      const id = (dbData.inventory && dbData.inventory.length) ? Math.max(...dbData.inventory.map(i => i.id || 0)) + 1 : 1;
      if (!dbData.inventory) dbData.inventory = [];
      dbData.inventory.push({
        id, name, category, unit, current_stock: Number(current_stock),
        min_threshold: Number(min_threshold), cost_per_unit: Number(cost_per_unit),
        supplier, linked_dishes: linked_dishes ? JSON.parse(linked_dishes) : [],
        last_restocked: new Date().toISOString().split('T')[0]
      });
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('UPDATE INVENTORY')) {
      const [name, category, unit, current_stock, min_threshold, cost_per_unit, supplier, linked_dishes, id] = params;
      if (!dbData.inventory) dbData.inventory = [];
      const item = dbData.inventory.find(i => i.id == id);
      if (item) {
        Object.assign(item, {
          name, category, unit, current_stock: Number(current_stock),
          min_threshold: Number(min_threshold), cost_per_unit: Number(cost_per_unit),
          supplier, linked_dishes: linked_dishes ? JSON.parse(linked_dishes) : []
        });
      }
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('DELETE FROM INVENTORY')) {
      const [id] = params;
      if (!dbData.inventory) dbData.inventory = [];
      dbData.inventory = dbData.inventory.filter(i => i.id != id);
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('INSERT OR REPLACE INTO SETTINGS')) {
      const [key, value] = params;
      const idx = dbData.settings.findIndex(s => s.key === key);
      if (idx !== -1) dbData.settings[idx].value = value;
      else dbData.settings.push({ key, value });
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('INSERT INTO SETTINGS')) {
      const [key, value] = params;
      dbData.settings.push({ key, value });
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('INSERT INTO PAYMENTS')) {
      const [order_id, transaction_id, amount, method, status] = params;
      const id = dbData.payments.length ? Math.max(...dbData.payments.map(p => p.id || 0)) + 1 : 1;
      dbData.payments.push({ id, order_id, transaction_id, amount, method, status, created_at: new Date().toISOString() });
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('INSERT INTO RECEIPTS')) {
      const [order_id, whatsapp_status] = params;
      const id = dbData.receipts.length ? Math.max(...dbData.receipts.map(r => r.id || 0)) + 1 : 1;
      dbData.receipts.push({ id, order_id, whatsapp_status, created_at: new Date().toISOString() });
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('UPDATE RECEIPTS SET WHATSAPP_STATUS')) {
      const [whatsapp_status, order_id] = params;
      const r = dbData.receipts.find(rec => rec.order_id == order_id);
      if (r) r.whatsapp_status = whatsapp_status;
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('UPDATE USERS SET PASSWORD_HASH')) {
      const [password_hash, email] = params;
      const u = dbData.users.find(user => user.email && user.email.toLowerCase() === (email || '').toLowerCase());
      if (u) {
        u.password_hash = password_hash;
        saveStore();
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    if (sqlUpper.startsWith('UPDATE USERS SET NAME')) {
      const [name, whatsapp_opt, id] = params;
      const u = dbData.users.find(user => user.id == id);
      if (u) {
        if (name) u.name = name;
        if (whatsapp_opt !== undefined) u.whatsapp_opt_in = whatsapp_opt ? 1 : 0;
        saveStore();
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    if (sqlUpper.startsWith('UPDATE ORDERS SET PAYMENT_STATUS')) {
      const [payment_status, order_status, id] = params;
      const o = dbData.orders.find(ord => ord.id == id || ord.order_number == id);
      if (o) {
        o.payment_status = payment_status;
        if (order_status) o.order_status = order_status;
        saveStore();
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    return { changes: 0 };
  }

  async get(sql, params = []) {
    loadStore();
    const sqlUpper = sql.trim().toUpperCase();

    if (sqlUpper.includes('FROM USERS WHERE EMAIL = ?') || sqlUpper.includes('WHERE EMAIL = ?') || sqlUpper.includes('WHERE LOWER(EMAIL)')) {
      const [email] = params;
      const cleanEmail = (email || '').trim().toLowerCase();
      return dbData.users.find(u => u.email && u.email.toLowerCase() === cleanEmail) || null;
    }

    if (sqlUpper.includes('FROM USERS WHERE PHONE') || sqlUpper.includes('WHERE PHONE = ?')) {
      const [phone, phone2] = params;
      return dbData.users.find(u => u.phone === phone || (phone2 && (u.email === phone2 || u.phone === phone2))) || null;
    }

    if (sqlUpper.includes('FROM USERS WHERE ID = ?')) {
      const [id] = params;
      return dbData.users.find(u => u.id == id) || null;
    }

    if (sqlUpper.includes('FROM ORDERS WHERE ORDER_NUMBER = ? OR ID = ?') || sqlUpper.includes('FROM ORDERS WHERE ORDER_NUMBER = ?') || sqlUpper.includes('FROM ORDERS WHERE ID = ?')) {
      const [val, val2] = params;
      return dbData.orders.find(o => o.order_number == val || o.id == val || (val2 && (o.order_number == val2 || o.id == val2))) || null;
    }

    if (sqlUpper.includes('FROM PAYMENTS WHERE ORDER_ID = ?')) {
      const [order_id] = params;
      return dbData.payments.find(p => p.order_id == order_id) || null;
    }

    if (sqlUpper.includes('COUNT(*)') && sqlUpper.includes('FROM ORDERS')) {
      const nonCancelled = dbData.orders.filter(o => o.order_status !== 'cancelled');
      const count = nonCancelled.length;
      const revenue = nonCancelled.reduce((sum, o) => sum + (o.total || 0), 0);
      const avg_order = count ? revenue / count : 0;
      return { count, revenue, avg_order };
    }

    return null;
  }

  async all(sql, params = []) {
    loadStore();
    const sqlUpper = sql.trim().toUpperCase();

    if (sqlUpper.includes('FROM MENU_CATEGORIES')) {
      return [...dbData.menu_categories].sort((a, b) => a.display_order - b.display_order);
    }

    if (sqlUpper.includes('FROM MENU_ITEMS')) {
      return dbData.menu_items.map(m => {
        const cat = dbData.menu_categories.find(c => c.id == m.category_id);
        return {
          ...m,
          category_name: cat ? cat.name : 'Specialty',
          category_slug: cat ? cat.slug : 'specialty'
        };
      });
    }

    if (sqlUpper.includes('FROM OFFERS')) {
      return [...dbData.offers];
    }

    if (sqlUpper.includes('FROM ADVERTISEMENTS')) {
      return [...dbData.advertisements];
    }

    if (sqlUpper.includes('FROM SETTINGS')) {
      return dbData.settings;
    }

    if (sqlUpper.includes('FROM INVENTORY')) {
      return dbData.inventory || [];
    }

    if (sqlUpper.includes('FROM ORDER_ITEMS WHERE ORDER_ID = ?')) {
      const [order_id] = params;
      return dbData.order_items.filter(i => i.order_id == order_id);
    }

    if (sqlUpper.includes('FROM ORDERS')) {
      return [...dbData.orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (sqlUpper.includes('FROM ACTIVITY_LOGS')) {
      return [...(dbData.activity_logs || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (sqlUpper.includes('FROM ADMIN_NOTIFICATIONS')) {
      return [...(dbData.admin_notifications || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (sqlUpper.includes('FROM TABLES')) {
      return dbData.tables || [];
    }

    return [];
  }
}

const dbInstance = new PureDb();

export default async function getDb() {
  return dbInstance;
}
