import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;
let isInMemoryPgMem = false;

/**
 * Utility: converts '?' placeholders to '$1, $2, ...' for PostgreSQL compatibility
 */
export function convertPlaceholders(sql) {
  let paramIndex = 1;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let out = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      out += char;
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      out += char;
    } else if (char === '?' && !inSingleQuote && !inDoubleQuote) {
      out += `$${paramIndex++}`;
    } else {
      out += char;
    }
  }
  return out;
}

export function getCafeBusinessDay(date = new Date()) {
  const d = new Date(date);
  // Cutoff at 2:00 AM (02:00). Orders between 00:00 and 01:59 belong to the previous day's shift
  if (d.getHours() < 2) {
    d.setDate(d.getDate() - 1);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const VALID_ORDER_STATUS_TRANSITIONS = {
  received: ['accepted', 'preparing', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['out_for_delivery', 'completed', 'cancelled'],
  out_for_delivery: ['completed', 'cancelled'],
  completed: [], // Terminal state
  cancelled: []  // Terminal state
};

export async function generateNextOrderNumber() {
  const db = await getDb();
  return await db.generateNextOrderNumber();
}

export function canTransitionOrderStatus(currentStatus, newStatus, isDelivery = false) {
  if (currentStatus === newStatus) return true;
  const normalizedCurrent = (currentStatus || 'received').toLowerCase();
  const normalizedNew = (newStatus || '').toLowerCase();

  const allowed = VALID_ORDER_STATUS_TRANSITIONS[normalizedCurrent] || [];
  return allowed.includes(normalizedNew);
}

class PgDatabase {
  constructor(pgPool, isMemory = false) {
    this.pool = pgPool;
    this.isMemory = isMemory;
  }

  async checkHealth() {
    try {
      const res = await this.pool.query('SELECT 1 as healthy');
      return { ok: true, healthy: res.rows[0].healthy === 1 };
    } catch (err) {
      return { ok: false, error: 'Database service is unreachable' };
    }
  }

  async query(sql, params = []) {
    const converted = convertPlaceholders(sql);
    return await this.pool.query(converted, params);
  }

  async get(sql, params = []) {
    const converted = convertPlaceholders(sql);
    const res = await this.pool.query(converted, params);
    return res.rows.length ? res.rows[0] : null;
  }

  async all(sql, params = []) {
    const converted = convertPlaceholders(sql);
    const res = await this.pool.query(converted, params);
    return res.rows;
  }

  async run(sql, params = []) {
    let converted = convertPlaceholders(sql.trim());
    const isInsert = converted.toUpperCase().startsWith('INSERT');
    if (isInsert && !converted.toUpperCase().includes('RETURNING')) {
      converted += ' RETURNING id';
    }

    const res = await this.pool.query(converted, params);
    const lastID = (res.rows && res.rows[0] && res.rows[0].id) ? res.rows[0].id : null;
    return {
      lastID,
      changes: res.rowCount || 0
    };
  }

  /**
   * Execute atomic transaction with BEGIN, COMMIT, and ROLLBACK
   */
  async transaction(fn) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const txProxy = {
        query: async (sql, params = []) => {
          const converted = convertPlaceholders(sql);
          return await client.query(converted, params);
        },
        get: async (sql, params = []) => {
          const converted = convertPlaceholders(sql);
          const res = await client.query(converted, params);
          return res.rows.length ? res.rows[0] : null;
        },
        all: async (sql, params = []) => {
          const converted = convertPlaceholders(sql);
          const res = await client.query(converted, params);
          return res.rows;
        },
        run: async (sql, params = []) => {
          let converted = convertPlaceholders(sql.trim());
          const isInsert = converted.toUpperCase().startsWith('INSERT');
          if (isInsert && !converted.toUpperCase().includes('RETURNING')) {
            converted += ' RETURNING id';
          }
          const res = await client.query(converted, params);
          const lastID = (res.rows && res.rows[0] && res.rows[0].id) ? res.rows[0].id : null;
          return { lastID, changes: res.rowCount || 0 };
        },
        decrementStockForOrderItem: async (menuItemId, qty) => {
          return await this.decrementStockForOrderItem(menuItemId, qty, txProxy);
        },
        restoreStockForOrderItem: async (menuItemId, qty) => {
          return await this.restoreStockForOrderItem(menuItemId, qty, txProxy);
        },
        addAdminNotification: async (opts) => {
          return await this.addAdminNotification(opts, txProxy);
        },
        logActivity: async (opts) => {
          return await this.logActivity(opts, txProxy);
        }
      };

      const result = await fn(txProxy);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // OTP persistent operations
  async getOtp(cleanPhone) {
    return await this.get('SELECT * FROM customer_otps WHERE phone = ?', [cleanPhone]);
  }

  async setOtp(cleanPhone, otpData) {
    const res = await this.query(`
      INSERT INTO customer_otps (phone, hashed_otp, expires_at, attempts, cooldown_until)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (phone) DO UPDATE SET
        hashed_otp = EXCLUDED.hashed_otp,
        expires_at = EXCLUDED.expires_at,
        attempts = EXCLUDED.attempts,
        cooldown_until = EXCLUDED.cooldown_until,
        created_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [cleanPhone, otpData.hashedOtp, otpData.expiresAt, otpData.attempts || 0, otpData.cooldownUntil]);
    return res.rows[0];
  }

  async deleteOtp(cleanPhone) {
    await this.query('DELETE FROM customer_otps WHERE phone = $1', [cleanPhone]);
  }

  // Activity Log helper
  async logActivity({ adminId, adminEmail, adminName, action, entity, entityId, details, reason, metadata }, client = null) {
    const runner = client || this;
    const res = await runner.query(`
      INSERT INTO activity_logs (admin_id, admin_email, admin_name, action, entity, entity_id, details, reason, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      adminId || null,
      adminEmail || 'system@frenchbellcafe.com',
      adminName || 'Admin',
      action,
      entity || null,
      entityId ? String(entityId) : null,
      details || null,
      reason || null,
      metadata ? JSON.stringify(metadata) : null
    ]);
    return res.rows[0];
  }

  // Admin Notification helper
  async addAdminNotification({ title, message, type = 'info', linkTab = 'live-orders' }, client = null) {
    const runner = client || this;
    const res = await runner.query(`
      INSERT INTO admin_notifications (title, message, type, link_tab, read)
      VALUES ($1, $2, $3, $4, 0)
      RETURNING *
    `, [title, message, type, linkTab]);
    return res.rows[0];
  }

  async getActiveAdminCount() {
    const res = await this.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active'");
    return parseInt(res?.count || '0', 10);
  }

  async decrementStockForOrderItem(menuItemId, qty, client = null) {
    const runner = client || this;
    const item = await runner.get('SELECT * FROM menu_items WHERE id = ?', [menuItemId]);
    if (!item) return;

    const currentStock = item.stock_quantity !== null && item.stock_quantity !== undefined ? Number(item.stock_quantity) : 20;
    const newStock = Math.max(0, currentStock - Number(qty));
    const newAvailable = newStock <= 0 ? 0 : item.available;

    await runner.query('UPDATE menu_items SET stock_quantity = $1, available = $2 WHERE id = $3', [newStock, newAvailable, menuItemId]);

    if (newStock <= 0) {
      await this.addAdminNotification({
        title: 'Stock Alert: Out of Stock',
        message: `"${item.name}" has reached 0 stock and is now marked OUT OF STOCK.`,
        type: 'warning',
        linkTab: 'menu-availability'
      }, client);
    } else if (newStock <= 5) {
      await this.addAdminNotification({
        title: 'Low Stock Alert',
        message: `"${item.name}" is running low (${newStock} units left in stock).`,
        type: 'warning',
        linkTab: 'menu-availability'
      }, client);
    }
  }

  async restoreStockForOrderItem(menuItemId, qty, client = null) {
    const runner = client || this;
    const item = await runner.get('SELECT * FROM menu_items WHERE id = ?', [menuItemId]);
    if (!item) return;

    const currentStock = item.stock_quantity !== null && item.stock_quantity !== undefined ? Number(item.stock_quantity) : 0;
    const newStock = currentStock + Number(qty);
    const newAvailable = newStock > 0 ? 1 : item.available;

    await runner.query('UPDATE menu_items SET stock_quantity = $1, available = $2 WHERE id = $3', [newStock, newAvailable, menuItemId]);
  }

  async generateNextOrderNumber() {
    const currentBusinessDay = getCafeBusinessDay(new Date());
    const startOfDay = `${currentBusinessDay} 02:00:00+00`;
    const nextDay = new Date(new Date(currentBusinessDay).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endOfDay = `${nextDay} 01:59:59.999+00`;

    const res = await this.get(`
      SELECT COUNT(*) as count FROM orders
      WHERE created_at >= $1 AND created_at <= $2
    `, [startOfDay, endOfDay]);

    const count = parseInt(res?.count || '0', 10);
    const nextSeq = count + 1;
    return `FB${String(nextSeq).padStart(3, '0')}`;
  }
}

let dbInstance = null;

export async function initDatabase() {
  if (dbInstance) return dbInstance;

  const isTest = process.env.NODE_ENV === 'test';
  const hasPgUrl = !!(process.env.DATABASE_URL || process.env.PGHOST);

  if (!hasPgUrl && isTest) {
    // Isolated In-Memory PostgreSQL Engine for Automated Tests
    const { newDb } = await import('pg-mem');
    const memDb = newDb();
    
    // Register custom functions needed by PostgreSQL schema if any
    memDb.public.registerFunction({
      name: 'current_timestamp',
      args: [],
      returns: memDb.public.getType('timestamp with time zone'),
      implementation: () => new Date()
    });

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // pg-mem executes schema commands
    memDb.public.none(schemaSql);

    const adapter = memDb.adapters.createPg();
    pool = new adapter.Pool();
    isInMemoryPgMem = true;
    dbInstance = new PgDatabase(pool, true);
    return dbInstance;
  }

  // Production or Development PostgreSQL Pool
  const connectionString = process.env.DATABASE_URL || `postgres://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'frenchbell'}`;

  pool = new Pool({
    connectionString,
    max: 20, // Connection pooling
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });

  dbInstance = new PgDatabase(pool, false);
  return dbInstance;
}

export default async function getDb() {
  if (!dbInstance) {
    await initDatabase();
  }
  return dbInstance;
}
