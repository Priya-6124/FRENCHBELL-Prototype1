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
  settings: []
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
  // Check /tmp first if on serverless (Vercel/Lambda)
  if ((process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) && fs.existsSync(tmpDbPath)) {
    try {
      const raw = fs.readFileSync(tmpDbPath, 'utf8');
      dbData = JSON.parse(raw);
      return;
    } catch (e) {}
  }

  if (fs.existsSync(dbJsonPath)) {
    try {
      const raw = fs.readFileSync(dbJsonPath, 'utf8');
      dbData = JSON.parse(raw);
    } catch (e) {}
  }
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

class PureDb {
  async exec(sql) {
    saveStore();
    return true;
  }

  async run(sql, params = []) {
    loadStore();
    const sqlUpper = sql.trim().toUpperCase();

    if (sqlUpper.startsWith('INSERT INTO USERS')) {
      const [name, phone, email, password_hash, role] = params;
      const id = dbData.users.length ? Math.max(...dbData.users.map(u => u.id || 0)) + 1 : 1;
      const user = { id, name, phone, email, password_hash, role: role || 'customer', created_at: new Date().toISOString() };
      dbData.users.push(user);
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('INSERT INTO MENU_CATEGORIES')) {
      const [id, name, slug, display_order] = params;
      dbData.menu_categories.push({ id, name, slug, display_order, active: 1 });
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('INSERT INTO MENU_ITEMS')) {
      const [category_id, name, description, image_url, veg_type, price, price_chicken, price_veg, available, popular] = params;
      const id = dbData.menu_items.length ? Math.max(...dbData.menu_items.map(m => m.id || 0)) + 1 : 1;
      const item = {
        id,
        category_id,
        name,
        description,
        image_url,
        veg_type: veg_type || 'veg',
        price,
        price_chicken: price_chicken || null,
        price_veg: price_veg || null,
        available: available !== undefined ? available : 1,
        popular: popular || 0,
        created_at: new Date().toISOString()
      };
      dbData.menu_items.push(item);
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('UPDATE MENU_ITEMS SET AVAILABLE')) {
      const [available, id] = params;
      const item = dbData.menu_items.find(m => m.id == id);
      if (item) item.available = available;
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('UPDATE MENU_ITEMS')) {
      const [category_id, name, description, image_url, veg_type, price, price_chicken, price_veg, available, popular, id] = params;
      const item = dbData.menu_items.find(m => m.id == id);
      if (item) {
        Object.assign(item, { category_id, name, description, image_url, veg_type, price, price_chicken, price_veg, available, popular });
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
        subtotal,
        discount,
        delivery_charge,
        total,
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
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('UPDATE ORDERS SET ORDER_STATUS')) {
      const [order_status, id] = params;
      const o = dbData.orders.find(ord => ord.id == id || ord.order_number == id);
      if (o) o.order_status = order_status;
      saveStore();
      return { changes: 1 };
    }

    if (sqlUpper.startsWith('INSERT INTO OFFERS')) {
      const [title, description, coupon_code, discount_type, discount_value, minimum_order, start_date, end_date, active] = params;
      const id = dbData.offers.length ? Math.max(...dbData.offers.map(o => o.id || 0)) + 1 : 1;
      dbData.offers.push({ id, title, description, coupon_code, discount_type, discount_value, minimum_order, start_date, end_date, active: active !== undefined ? active : 1 });
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
      const [title, image_url, description, cta, active] = params;
      const id = dbData.advertisements.length ? Math.max(...dbData.advertisements.map(a => a.id || 0)) + 1 : 1;
      dbData.advertisements.push({ id, title, image_url, description, cta, active: active !== undefined ? active : 1 });
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('DELETE FROM ADVERTISEMENTS')) {
      const [id] = params;
      dbData.advertisements = dbData.advertisements.filter(a => a.id != id);
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

    return { changes: 0 };
  }

  async get(sql, params = []) {
    loadStore();
    const sqlUpper = sql.trim().toUpperCase();

    if (sqlUpper.includes('FROM USERS WHERE PHONE') || sqlUpper.includes('WHERE PHONE = ?')) {
      const [phone, phone2] = params;
      return dbData.users.find(u => u.phone === phone || (phone2 && u.email === phone2)) || null;
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
      return dbData.offers.filter(o => o.active == 1);
    }

    if (sqlUpper.includes('FROM ADVERTISEMENTS')) {
      return dbData.advertisements.filter(a => a.active == 1);
    }

    if (sqlUpper.includes('FROM SETTINGS')) {
      return dbData.settings;
    }

    if (sqlUpper.includes('FROM ORDER_ITEMS WHERE ORDER_ID = ?')) {
      const [order_id] = params;
      return dbData.order_items.filter(i => i.order_id == order_id);
    }

    if (sqlUpper.includes('FROM ORDERS')) {
      return [...dbData.orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return [];
  }
}

const dbInstance = new PureDb();

export default async function getDb() {
  return dbInstance;
}
