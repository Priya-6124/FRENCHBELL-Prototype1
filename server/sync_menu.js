import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_MENU_ITEMS, INITIAL_CATEGORIES } from '../src/data/menuData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'frenchbell_db.json');
let data = {
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

if (fs.existsSync(dbPath)) {
  try {
    data = { ...data, ...JSON.parse(fs.readFileSync(dbPath, 'utf8')) };
  } catch (e) {}
}

// 1. Sync Categories
data.menu_categories = INITIAL_CATEGORIES.map(c => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  display_order: c.display_order,
  active: c.active !== undefined ? c.active : 1
}));

// 2. Sync Menu Items (all 46 distinct items with unique photos, separated veg/non-veg momos, stock)
data.menu_items = INITIAL_MENU_ITEMS.map(item => ({
  id: item.id,
  category_id: item.category_id,
  name: item.name,
  description: item.description,
  image_url: item.image_url,
  veg_type: item.veg_type,
  price: item.price,
  available: item.available !== undefined ? item.available : 1,
  popular: item.popular || 0,
  stock_quantity: item.stock_quantity !== undefined ? item.stock_quantity : 20,
  prep_time_mins: item.prep_time_mins || 12,
  is_special: item.is_special || 0,
  is_recommended: item.is_recommended || 0,
  created_at: new Date().toISOString()
}));

// 3. Ensure collections exist
if (!data.admin_invitations) data.admin_invitations = [];
if (!data.admin_password_resets) data.admin_password_resets = [];
if (!data.admin_notifications) data.admin_notifications = [];
if (!data.activity_logs) data.activity_logs = [];

if (data.activity_logs.length === 0) {
  data.activity_logs.push({
    id: 1,
    admin_id: 1,
    admin_email: 'manager@frenchbellcafe.com',
    admin_name: 'Operations Manager',
    action: 'System Initialized',
    entity: 'system',
    details: 'FrenchBell Cafe operations portal upgraded with real email & management suite',
    created_at: new Date().toISOString()
  });
}

// 4. Ensure Tables exist
if (!data.tables || data.tables.length === 0) {
  data.tables = [];
  for (let t = 1; t <= 12; t++) {
    const tableNum = String(t).padStart(2, '0');
    data.tables.push({
      id: t,
      table_number: tableNum,
      name: `Table #${tableNum}`,
      capacity: t <= 4 ? 2 : (t <= 8 ? 4 : 6),
      status: 'active',
      qr_url: `/?table=${tableNum}&mode=dine-in`
    });
  }
}

// 5. Ensure Admin status is active
data.users = data.users.map(u => {
  if (u.role === 'admin' && !u.status) {
    return { ...u, status: 'active' };
  }
  return u;
});

// 6. Settings default sync
const defaultSettings = [
  { key: 'cafe_name', value: 'FrenchBell Cafe' },
  { key: 'cafe_address', value: 'K. Narayanpura, Bengaluru – 560077, Karnataka' },
  { key: 'cafe_phone', value: '+91 98765 43210' },
  { key: 'cafe_email', value: 'manager@frenchbellcafe.com' },
  { key: 'cafe_logo', value: '/assets/logo.jfif' },
  { key: 'free_delivery_km', value: '2' },
  { key: 'delivery_fee_per_km', value: '15' },
  { key: 'min_order_delivery', value: '120' },
  { key: 'dine_in_enabled', value: '1' },
  { key: 'takeaway_enabled', value: '1' },
  { key: 'delivery_enabled', value: '1' },
  { key: 'default_prep_time_mins', value: '15' },
  { key: 'min_order_amount', value: '99' },
  { key: 'business_hours', value: JSON.stringify({
    Monday: { open: '11:00 AM', close: '11:30 PM', closed: false },
    Tuesday: { open: '11:00 AM', close: '11:30 PM', closed: false },
    Wednesday: { open: '11:00 AM', close: '11:30 PM', closed: false },
    Thursday: { open: '11:00 AM', close: '11:30 PM', closed: false },
    Friday: { open: '11:00 AM', close: '11:30 PM', closed: false },
    Saturday: { open: '11:00 AM', close: '11:30 PM', closed: false },
    Sunday: { open: '11:00 AM', close: '11:30 PM', closed: false }
  }) }
];

defaultSettings.forEach(ds => {
  const existing = data.settings.find(s => s.key === ds.key);
  if (!existing) {
    data.settings.push(ds);
  }
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully synced all FrenchBell Cafe data into frenchbell_db.json!');
