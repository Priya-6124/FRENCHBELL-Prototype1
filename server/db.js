import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbJsonPath = path.join(__dirname, 'frenchbell_db.json');

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

function loadStore() {
  if (fs.existsSync(dbJsonPath)) {
    try {
      const raw = fs.readFileSync(dbJsonPath, 'utf8');
      dbData = JSON.parse(raw);
    } catch (e) {}
  }
}

function saveStore() {
  try {
    fs.writeFileSync(dbJsonPath, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (e) {}
}

loadStore();

class PureDb {
  async exec(sql) {
    // Schema exec placeholder
    saveStore();
    return true;
  }

  async run(sql, params = []) {
    loadStore();
    const sqlUpper = sql.trim().toUpperCase();

    if (sqlUpper.startsWith('INSERT INTO USERS')) {
      const [name, phone, email, password_hash, role] = params;
      const id = dbData.users.length ? Math.max(...dbData.users.map(u => u.id)) + 1 : 1;
      const user = { id, name, phone, email, password_hash, role, created_at: new Date().toISOString() };
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
      const [category_id, name, description, image_url, veg_type, price, price_chicken, price_veg, popular] = params;
      const id = dbData.menu_items.length ? Math.max(...dbData.menu_items.map(m => m.id)) + 1 : 1;
      const item = { id, category_id, name, description, image_url, veg_type, price, price_chicken, price_veg, available: 1, popular, created_at: new Date().toISOString() };
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

      const id = dbData.orders.length ? Math.max(...dbData.orders.map(o => o.id)) + 1 : 1;
      const order = {
        id, order_number, user_id, order_type, table_number, num_people, customer_name, phone,
        pickup_time, delivery_address, landmark, pincode, subtotal, discount,
        delivery_charge, total, payment_status, payment_method, order_status, special_instructions,
        created_at: new Date().toISOString()
      };
      dbData.orders.push(order);
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('INSERT INTO ORDER_ITEMS')) {
      const [order_id, menu_item_id, item_name, variant, quantity, unit_price, total_price] = params;
      const id = dbData.order_items.length ? Math.max(...dbData.order_items.map(o => o.id)) + 1 : 1;
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
      const id = dbData.offers.length ? Math.max(...dbData.offers.map(o => o.id)) + 1 : 1;
      dbData.offers.push({ id, title, description, coupon_code, discount_type, discount_value, minimum_order, start_date, end_date, active });
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
      const id = dbData.advertisements.length ? Math.max(...dbData.advertisements.map(a => a.id)) + 1 : 1;
      dbData.advertisements.push({ id, title, image_url, description, cta, active });
      saveStore();
      return { lastID: id };
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
      const id = dbData.payments.length ? Math.max(...dbData.payments.map(p => p.id)) + 1 : 1;
      dbData.payments.push({ id, order_id, transaction_id, amount, method, status, created_at: new Date().toISOString() });
      saveStore();
      return { lastID: id };
    }

    if (sqlUpper.startsWith('INSERT INTO RECEIPTS')) {
      const [order_id, whatsapp_status] = params;
      const id = dbData.receipts.length ? Math.max(...dbData.receipts.map(r => r.id)) + 1 : 1;
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

    saveStore();
    return { lastID: Date.now(), changes: 1 };
  }

  async get(sql, params = []) {
    loadStore();
    const sqlUpper = sql.trim().toUpperCase();

    if (sqlUpper.includes('FROM USERS WHERE PHONE')) {
      return dbData.users.find(u => u.phone === params[0] || u.email === params[0]) || null;
    }
    if (sqlUpper.includes('FROM USERS WHERE ID')) {
      return dbData.users.find(u => u.id == params[0]) || null;
    }
    if (sqlUpper.includes('FROM ORDERS WHERE ORDER_NUMBER')) {
      return dbData.orders.find(o => o.order_number === params[0] || o.id == params[0]) || null;
    }
    if (sqlUpper.includes('FROM ORDERS WHERE ID')) {
      return dbData.orders.find(o => o.id == params[0]) || null;
    }
    if (sqlUpper.includes('FROM PAYMENTS WHERE ORDER_ID')) {
      return dbData.payments.find(p => p.order_id == params[0]) || null;
    }
    if (sqlUpper.includes('SELECT COUNT(*) AS COUNT, SUM(TOTAL)')) {
      const valid = dbData.orders.filter(o => o.order_status !== 'cancelled');
      const count = valid.length;
      const revenue = valid.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const avg = count ? revenue / count : 0;
      return { count, revenue, avg_order: avg };
    }
    if (sqlUpper.includes('WHERE ORDER_STATUS IN ("RECEIVED"')) {
      const count = dbData.orders.filter(o => ['received', 'preparing', 'accepted'].includes(o.order_status)).length;
      return { count };
    }
    if (sqlUpper.includes('WHERE ORDER_STATUS = "COMPLETED"')) {
      const count = dbData.orders.filter(o => o.order_status === 'completed').length;
      return { count };
    }
    if (sqlUpper.includes('DISTINCT PHONE')) {
      const set = new Set(dbData.orders.map(o => o.phone));
      return { count: set.size };
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
        const cat = dbData.menu_categories.find(c => c.id === m.category_id);
        return { ...m, category_name: cat ? cat.name : 'Starters', category_slug: cat ? cat.slug : 'starters' };
      });
    }
    if (sqlUpper.includes('FROM ORDERS')) {
      let res = [...dbData.orders];
      if (params.length && sqlUpper.includes('ORDER_STATUS = ?')) {
        res = res.filter(o => o.order_status === params[0]);
      }
      if (params.length && sqlUpper.includes('PHONE = ?')) {
        res = res.filter(o => o.phone === params[params.length - 1]);
      }
      return res.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    if (sqlUpper.includes('FROM ORDER_ITEMS WHERE ORDER_ID')) {
      return dbData.order_items.filter(i => i.order_id == params[0]);
    }
    if (sqlUpper.includes('FROM OFFERS')) {
      return dbData.offers.filter(o => o.active === 1);
    }
    if (sqlUpper.includes('FROM ADVERTISEMENTS')) {
      return dbData.advertisements.filter(a => a.active === 1);
    }
    if (sqlUpper.includes('FROM SETTINGS')) {
      return dbData.settings;
    }
    if (sqlUpper.includes('GROUP BY ORDER_TYPE')) {
      const types = ['dine-in', 'takeaway', 'delivery'];
      return types.map(t => {
        const matching = dbData.orders.filter(o => o.order_type === t);
        return {
          order_type: t,
          count: matching.length,
          revenue: matching.reduce((s, o) => s + Number(o.total || 0), 0)
        };
      });
    }
    if (sqlUpper.includes('GROUP BY ITEM_NAME')) {
      const itemMap = {};
      dbData.order_items.forEach(i => {
        if (!itemMap[i.item_name]) itemMap[i.item_name] = { item_name: i.item_name, total_qty: 0, total_sales: 0 };
        itemMap[i.item_name].total_qty += Number(i.quantity);
        itemMap[i.item_name].total_sales += Number(i.total_price);
      });
      return Object.values(itemMap).sort((a, b) => b.total_qty - a.total_qty).slice(0, 5);
    }
    return [];
  }
}

const dbInstance = new PureDb();

export async function getDb() {
  return dbInstance;
}

export default getDb;
