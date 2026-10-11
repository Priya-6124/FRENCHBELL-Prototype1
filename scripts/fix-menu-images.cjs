/**
 * fix-menu-images.js
 * 
 * Patches frenchbell_db.json to assign semantically relevant, distinct
 * Unsplash CDN image URLs to every menu item.
 * 
 * Run: node scripts/fix-menu-images.js
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'server', 'frenchbell_db.json');

// Curated Unsplash photo IDs – each one is distinct and matches the dish name.
// Format: https://images.unsplash.com/photo-<ID>?auto=format&fit=crop&w=600&q=80
const IMAGE_MAP = {
  // ─── STARTERS ──────────────────────────────────────────────────────────────
  1:  'photo-1541592106381-b31e9677c0e5', // Classic Fries         – golden fries
  2:  'photo-1630384060421-cb20d0e0649d', // Peri Peri Fries       – spiced fries
  3:  'photo-1585109649139-366815a0d713', // Cheesy Fries           – cheesy fries with sauce
  4:  'photo-1562967914-608f82629710',    // Chicken Nuggets        – nuggets plated

  // ─── STRIPS ────────────────────────────────────────────────────────────────
  5:  'photo-1598515214211-89d3c73ae83b', // Crispy Classic Strips  – crispy chicken strips
  6:  'photo-1626645738196-c2a7c87a8f58', // Peri Peri Strips       – peri-peri chicken strips
  7:  'photo-1626082927389-6cd097cdc6ec', // Thai Honey Strips      – glazed fried chicken strips
  8:  'photo-1567620832903-9fc6debc209f', // Dynamite Strips        – saucy fried strips

  // ─── MOMOS ─────────────────────────────────────────────────────────────────
  9:  'photo-1496116218417-1a781b1c416c', // Veg Fried Momos        – fried dumplings
  10: 'photo-1534422298391-e4f8c172dddb', // Chicken Fried Momos    – chicken dumplings
  11: 'photo-1526318896980-cf78c088247c', // Veg Peri Peri Momos    – spiced veg momos/dumplings
  12: 'photo-1541696432-82c6da8ce7bf',    // Chicken Peri Peri Momos – spiced chicken momos
  13: 'photo-1563245372-f21724e3856d',    // Veg Dynamite Momos     – saucy veg dumplings
  14: 'photo-1559314809-0d155014e29e',    // Chicken Dynamite Momos – saucy chicken dumplings
  15: 'photo-1505253758473-96b7015fcd40', // Veg Kanthari Momos     – chilli-tossed veg momos
  16: 'photo-1582878826629-29b7ad1cdc43', // Chicken Kanthari Momos – chilli chicken momos
  17: 'photo-1567620905732-2d1ec7ab7445', // Veg BBQ Momos          – bbq/grilled veg dumplings
  18: 'photo-1529042410759-befb1204b468', // Chicken BBQ Momos      – bbq chicken wrap (close match)
  19: 'photo-1565557623262-b51c2513a641', // Veg Honey Chilli Momos – honey chilli asian dish
  20: 'photo-1563379091339-03b21ab4a4f8', // Chicken Honey Chilli Momos – honey chilli chicken
  21: 'photo-1512058564366-18510be2db19', // Veg Schezwan Momos     – schezwan noodles/dish
  22: 'photo-1525755662778-989d0524087e', // Chicken Schezwan Momos – schezwan chicken

  // ─── BURGERS ───────────────────────────────────────────────────────────────
  23: 'photo-1550547660-d9450f859349',    // Crispy Veg Burger      – veg burger
  24: 'photo-1568901346375-23c9450c58cd', // Classic Chicken Burger – classic chicken burger
  25: 'photo-1572802419224-296b0aeee0d9', // Zinger Crunchy Burger  – zinger burger
  26: 'photo-1586190848861-99aa4a171e90', // Double Chicken Burger  – double patty burger
  27: 'photo-1553979459-d2229ba7433b',    // Double Zinger Supreme  – supreme chicken burger
  28: 'photo-1520072959219-c595dc870360', // Cheesy Alfredo Burger  – cheesy burger

  // ─── SANDWICH ──────────────────────────────────────────────────────────────
  29: 'photo-1528735602780-2552fd46c7af', // Garden Veg Sandwich    – fresh veg sandwich
  30: 'photo-1554433607-66b5efe9d304',    // Paneer Club Sandwich   – club sandwich / paneer
  31: 'photo-1567234669003-dce7a7a88821', // Shredded Chicken Sand. – shredded chicken sandwich
  32: 'photo-1606755962773-d324e0a13086', // Chicken Club Sandwich  – chicken club
  33: 'photo-1528736235302-52922df5c122', // Crispy Chicken Sand.   – crispy chicken sandwich
  34: 'photo-1509722747041-616f39b57569', // Nachos Loaded Club     – nachos / loaded sandwich

  // ─── ROLLS ─────────────────────────────────────────────────────────────────
  35: 'photo-1626700051175-6818013e1d4f', // Veg Frankie Roll       – veg frankie roll
  36: 'photo-1546069901-ba9599a7e63c',    // Tandoori Paneer Roll   – paneer roll / wrap
  37: 'photo-1627308595229-7830a5c91f9f', // Mexican Salsa Roll     – mexican wrap/salsa
  38: 'photo-1565299585323-38d6b0865b47', // Crispy Chicken Roll    – crispy chicken roll
  39: 'photo-1540420773420-3366772f4999', // Thai Honey Chicken Roll – thai chicken wrap
  40: 'photo-1561651823-34feb02250e4',    // Dynamite Chicken Roll  – dynamite roll

  // ─── LOADED ────────────────────────────────────────────────────────────────
  41: 'photo-1573080496219-bb080dd4f877', // Cheesy Veggie Loaded Fries – loaded veg fries
  42: 'photo-1586816001966-79b736744398', // Cheesy Blaster Loaded Bowl – loaded bowl / mac
  43: 'photo-1585325701165-351af916e581', // Chicken Popcorn Loaded – popcorn chicken
  44: 'photo-1504674900247-0877df9cc836', // Monster Meat Loaded Platter – big meat platter

  // ─── PLATTERS ──────────────────────────────────────────────────────────────
  45: 'photo-1555939594-58d7cb561ad1',    // Veg Sampler Platter    – veg platter / spread
  46: 'photo-1544025162-d76694265947',    // Grand Non-Veg Feast    – non-veg feast platter
};

const BASE = 'https://images.unsplash.com';
const PARAMS = '?auto=format&fit=crop&w=600&q=80';

function buildUrl(photoId) {
  return `${BASE}/${photoId}${PARAMS}`;
}

// ── Load DB ──────────────────────────────────────────────────────────────────
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

let changed = 0;
const report = [];

db.menu_items = db.menu_items.map(item => {
  const photoId = IMAGE_MAP[item.id];
  if (!photoId) {
    report.push(`  ⚠️  No mapping for item id=${item.id} "${item.name}" – skipped`);
    return item;
  }

  const newUrl = buildUrl(photoId);
  const oldUrl = item.image_url;

  if (oldUrl === newUrl) {
    report.push(`  ✅ id=${item.id} "${item.name}" – unchanged (already correct)`);
    return item;
  }

  changed++;
  report.push(`  🔄 id=${item.id} "${item.name}" – updated`);
  return { ...item, image_url: newUrl };
});

// ── Uniqueness check ─────────────────────────────────────────────────────────
const urls = db.menu_items.map(i => i.image_url);
const seen = new Set();
const duplicates = [];
urls.forEach((url, idx) => {
  if (seen.has(url)) duplicates.push(db.menu_items[idx].name);
  seen.add(url);
});

// ── Save ─────────────────────────────────────────────────────────────────────
fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');

// ── Report ───────────────────────────────────────────────────────────────────
console.log('\n=== FrenchBell Menu Image Fix ===\n');
report.forEach(l => console.log(l));
console.log(`\nTotal items: ${db.menu_items.length}`);
console.log(`Updated: ${changed}`);
if (duplicates.length > 0) {
  console.log(`\n⚠️  DUPLICATE images detected for: ${duplicates.join(', ')}`);
} else {
  console.log('\n✅ All images are unique');
}
console.log('\nDone. Restart the server to pick up changes.\n');
