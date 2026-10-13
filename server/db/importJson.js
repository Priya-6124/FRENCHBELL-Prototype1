import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import getDb from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function importFromJson(customJsonPath = null) {
  const jsonPath = customJsonPath || path.join(__dirname, '../frenchbell_db.json');
  if (!fs.existsSync(jsonPath)) {
    console.warn(`[Import JSON] File not found at ${jsonPath}. Skipping JSON import.`);
    return { success: false, message: 'JSON file not found' };
  }

  console.log(`[Import JSON] Reading data from ${jsonPath}...`);
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);
  const db = await getDb();

  const counts = {
    users: 0,
    categories: 0,
    items: 0,
    orders: 0,
    order_items: 0,
    payments: 0,
    receipts: 0,
    offers: 0,
    advertisements: 0,
    settings: 0,
    inventory: 0,
    invitations: 0,
    activity_logs: 0
  };

  await db.transaction(async (tx) => {
    // Helper for updating serial sequence on real Postgres
    const updateSequence = async (table) => {
      try {
        await tx.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 1)) FROM ${table}`);
      } catch (e) {}
    };

    // 1. Categories
    if (Array.isArray(data.menu_categories)) {
      for (const cat of data.menu_categories) {
        const res = await tx.query(`
          INSERT INTO menu_categories (id, name, slug, display_order, active)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            display_order = EXCLUDED.display_order,
            active = EXCLUDED.active
        `, [cat.id, cat.name, cat.slug, cat.display_order || 0, cat.active !== undefined ? (cat.active ? 1 : 0) : 1]);
        if (res.rowCount > 0) counts.categories++;
      }
      await updateSequence('menu_categories');
    }

    // 2. Menu Items
    if (Array.isArray(data.menu_items)) {
      for (const item of data.menu_items) {
        const res = await tx.query(`
          INSERT INTO menu_items (id, category_id, name, description, image_url, veg_type, price, price_chicken, price_veg, available, popular, stock_quantity, prep_time_mins, is_special, is_recommended)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            price = EXCLUDED.price,
            stock_quantity = EXCLUDED.stock_quantity,
            available = EXCLUDED.available
        `, [
          item.id,
          item.category_id || 1,
          item.name,
          item.description || null,
          item.image_url || null,
          item.veg_type || 'veg',
          Number(item.price) || 0,
          item.price_chicken ? Number(item.price_chicken) : null,
          item.price_veg ? Number(item.price_veg) : null,
          item.available !== undefined ? (item.available ? 1 : 0) : 1,
          item.popular ? 1 : 0,
          item.stock_quantity !== undefined ? Number(item.stock_quantity) : 20,
          item.prep_time_mins ? Number(item.prep_time_mins) : 12,
          item.is_special ? 1 : 0,
          item.is_recommended ? 1 : 0
        ]);
        if (res.rowCount > 0) counts.items++;
      }
      await updateSequence('menu_items');
    }

    // 3. Users
    if (Array.isArray(data.users)) {
      for (const user of data.users) {
        const cleanPhone = user.phone ? String(user.phone).replace(/\D/g, '').slice(-10) : null;
        const cleanEmail = user.email ? String(user.email).trim().toLowerCase() : null;

        const res = await tx.query(`
          INSERT INTO users (id, name, phone, email, password_hash, role, status, whatsapp_opt_in, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [
          user.id,
          user.name || 'User',
          cleanPhone,
          cleanEmail,
          user.password_hash || '$2a$10$MaNJe9WwiyB8O6hBKp4VnOBhiIwiE6.yrdy/MQS4TBaPL2MrTrX0m',
          user.role || 'customer',
          user.status || 'active',
          user.whatsapp_opt_in !== undefined ? (user.whatsapp_opt_in ? 1 : 0) : 1,
          user.created_at ? new Date(user.created_at) : new Date()
        ]);
        if (res.rowCount > 0) counts.users++;
      }
      await updateSequence('users');
    }

    // 4. Settings
    if (Array.isArray(data.settings)) {
      for (const s of data.settings) {
        await tx.query(`
          INSERT INTO settings (key, value)
          VALUES ($1, $2)
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `, [s.key, s.value]);
        counts.settings++;
      }
    }

    // 5. Offers
    if (Array.isArray(data.offers)) {
      for (const o of data.offers) {
        await tx.query(`
          INSERT INTO offers (id, title, description, coupon_code, discount_type, discount_value, minimum_order, max_discount, valid_from, valid_until, applicable_order_type, active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (coupon_code) DO NOTHING
        `, [
          o.id,
          o.title,
          o.description || null,
          (o.coupon_code || '').toUpperCase(),
          o.discount_type || 'fixed',
          Number(o.discount_value) || 0,
          Number(o.minimum_order) || 0,
          o.max_discount ? Number(o.max_discount) : null,
          o.valid_from || o.start_date || null,
          o.valid_until || o.end_date || null,
          o.applicable_order_type || 'all',
          o.active !== undefined ? (o.active ? 1 : 0) : 1
        ]);
        counts.offers++;
      }
      await updateSequence('offers');
    }

    // 6. Advertisements
    if (Array.isArray(data.advertisements)) {
      for (const a of data.advertisements) {
        await tx.query(`
          INSERT INTO advertisements (id, title, image_url, description, cta, start_date, end_date, active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING
        `, [
          a.id, a.title, a.image_url, a.description || null, a.cta || 'Order Now', a.start_date || null, a.end_date || null, a.active !== undefined ? (a.active ? 1 : 0) : 1
        ]);
        counts.advertisements++;
      }
      await updateSequence('advertisements');
    }

    // 7. Orders
    if (Array.isArray(data.orders)) {
      const seenOrderNumbers = new Set();
      for (const ord of data.orders) {
        let finalOrderNum = ord.order_number;
        if (seenOrderNumbers.has(finalOrderNum)) {
          finalOrderNum = `${ord.order_number}-${ord.id}`;
        }
        seenOrderNumbers.add(finalOrderNum);

        await tx.query(`
          INSERT INTO orders (id, order_number, user_id, order_type, table_number, num_people, customer_name, phone, pickup_time, delivery_address, landmark, pincode, subtotal, discount, delivery_charge, tax, total, payment_status, payment_method, order_status, special_instructions, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          ON CONFLICT (id) DO UPDATE SET
            order_number = EXCLUDED.order_number,
            payment_status = EXCLUDED.payment_status,
            order_status = EXCLUDED.order_status
        `, [
          ord.id, finalOrderNum, ord.user_id || null, ord.order_type || 'takeaway', ord.table_number || null, ord.num_people || null, ord.customer_name || 'Customer', ord.phone || '0000000000', ord.pickup_time || null, ord.delivery_address || null, ord.landmark || null, ord.pincode || null, Number(ord.subtotal) || Number(ord.total) || 0, Number(ord.discount) || 0, Number(ord.delivery_charge) || 0, Number(ord.tax) || 0, Number(ord.total) || 0, ord.payment_status || 'paid', ord.payment_method || 'upi', ord.order_status || 'received', ord.special_instructions || null, ord.created_at ? new Date(ord.created_at) : new Date()
        ]);
        counts.orders++;
      }
      await updateSequence('orders');
    }

    // 8. Order Items
    if (Array.isArray(data.order_items)) {
      for (const oi of data.order_items) {
        await tx.query(`
          INSERT INTO order_items (id, order_id, menu_item_id, item_name, variant, quantity, unit_price, total_price, special_instructions)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [
          oi.id, oi.order_id, oi.menu_item_id || null, oi.item_name || 'Item', oi.variant || null, Number(oi.quantity) || 1, Number(oi.unit_price) || 0, Number(oi.total_price) || 0, oi.special_instructions || null
        ]);
        counts.order_items++;
      }
      await updateSequence('order_items');
    }

    // 9. Payments
    if (Array.isArray(data.payments)) {
      for (const p of data.payments) {
        await tx.query(`
          INSERT INTO payments (id, order_id, transaction_id, provider, amount, currency, method, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (transaction_id) DO NOTHING
        `, [
          p.id, p.order_id, p.transaction_id || `TXN_${Date.now()}_${p.id}`, p.provider || 'simulated', Number(p.amount) || 0, 'INR', p.method || 'upi', p.status || 'successful', p.created_at ? new Date(p.created_at) : new Date()
        ]);
        counts.payments++;
      }
      await updateSequence('payments');
    }

    // 10. Receipts
    if (Array.isArray(data.receipts)) {
      for (const r of data.receipts) {
        const rcptNum = `RCP_ORDER_${r.order_id || r.id}`;
        await tx.query(`
          INSERT INTO receipts (id, order_id, receipt_number, destination_phone, delivery_status, provider, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (receipt_number) DO NOTHING
        `, [
          r.id, r.order_id, rcptNum, r.phone || null, r.whatsapp_status || 'unconfigured', 'none', r.created_at ? new Date(r.created_at) : new Date()
        ]);
        counts.receipts++;
      }
      await updateSequence('receipts');
    }

    // 11. Admin Invitations
    if (Array.isArray(data.admin_invitations)) {
      for (const inv of data.admin_invitations) {
        await tx.query(`
          INSERT INTO admin_invitations (id, email, token, status, invited_by, invited_by_name, expires_at, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (token) DO NOTHING
        `, [
          inv.id, inv.email.toLowerCase(), inv.token, inv.status || 'pending', inv.invited_by || 'system', inv.invited_by_name || 'Admin', new Date(inv.expires_at || Date.now() + 72*3600*1000), inv.created_at ? new Date(inv.created_at) : new Date()
        ]);
        counts.invitations++;
      }
      await updateSequence('admin_invitations');
    }

    // 12. Activity Logs
    if (Array.isArray(data.activity_logs)) {
      for (const l of data.activity_logs) {
        await tx.query(`
          INSERT INTO activity_logs (id, admin_id, admin_email, admin_name, action, entity, entity_id, details, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [
          l.id, l.admin_id || null, l.admin_email || null, l.admin_name || l.adminName || 'Admin', l.action, l.entity || null, l.entity_id ? String(l.entity_id) : null, l.details || null, l.created_at ? new Date(l.created_at) : new Date()
        ]);
        counts.activity_logs++;
      }
      await updateSequence('activity_logs');
    }
  });

  console.log('[Import JSON] Import completed successfully. Records imported:', counts);
  return { success: true, counts };
}

if (process.argv[1] && process.argv[1].endsWith('importJson.js')) {
  importFromJson()
    .then((res) => {
      console.log('[Import JSON] Finished:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Import JSON Error] Failed:', err);
      process.exit(1);
    });
}
