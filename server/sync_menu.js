import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_MENU_ITEMS } from '../src/data/menuData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../server/frenchbell_db.json');
const raw = fs.readFileSync(dbPath, 'utf8');
const data = JSON.parse(raw);

// Sync menu_items
data.menu_items = INITIAL_MENU_ITEMS.map((item, idx) => ({
  id: item.id,
  category_id: item.category_id,
  name: item.name,
  description: item.description,
  image_url: item.image_url,
  veg_type: item.veg_type,
  price: item.price,
  price_chicken: item.price_chicken || null,
  price_veg: item.price_veg || null,
  available: 1,
  popular: item.popular || 0,
  created_at: new Date().toISOString()
}));

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully synced 49 menu items into frenchbell_db.json!');
