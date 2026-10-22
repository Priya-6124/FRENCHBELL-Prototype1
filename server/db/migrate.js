
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import getDb from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('[Migration] Starting FrenchBell Cafe PostgreSQL schema migration...');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const db = await getDb();

  // Create missing tables and indexes first.
  await db.transaction(async (tx) => {
    await tx.query(schemaSql);
  });

    // Add Razorpay order ID support to existing payment records.
  await db.transaction(async (tx) => {
    await tx.query(`
      ALTER TABLE public.payments
      ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);
    `);

    await tx.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id
      ON public.payments (razorpay_order_id);
    `);

    await tx.query(`
      ALTER TABLE public.menu_items
      ADD COLUMN IF NOT EXISTS customizations TEXT;
    `);

    await tx.query(`
      ALTER TABLE public.order_items
      ADD COLUMN IF NOT EXISTS customizations TEXT;
    `);
  });
  
  // Migrate existing orders without deleting any records.
  await db.transaction(async (tx) => {
    await tx.query(`
      ALTER TABLE public.orders
      ADD COLUMN IF NOT EXISTS business_day DATE;
    `);

    await tx.query(`
      UPDATE public.orders
      SET business_day = CASE
        WHEN (created_at AT TIME ZONE 'Asia/Kolkata')::time < TIME '02:00'
          THEN (created_at AT TIME ZONE 'Asia/Kolkata')::date - 1
        ELSE (created_at AT TIME ZONE 'Asia/Kolkata')::date
      END
      WHERE business_day IS NULL;
    `);

    // Remove UNIQUE constraints on order_number alone.
    await tx.query(`
      DO $$
      DECLARE
        constraint_record RECORD;
        index_record RECORD;
      BEGIN
        -- Drop UNIQUE constraints on order_number alone.
        FOR constraint_record IN
          SELECT c.conname
          FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          JOIN pg_namespace n ON n.oid = t.relnamespace
          WHERE n.nspname = 'public'
            AND t.relname = 'orders'
            AND c.contype = 'u'
            AND (
              SELECT array_agg(a.attname ORDER BY a.attname)
              FROM unnest(c.conkey) AS key_column(attnum)
              JOIN pg_attribute a
                ON a.attrelid = t.oid
               AND a.attnum = key_column.attnum
            ) = ARRAY['order_number']::name[]
        LOOP
          EXECUTE format(
            'ALTER TABLE public.orders DROP CONSTRAINT %I',
            constraint_record.conname
          );
        END LOOP;

        -- Drop standalone UNIQUE indexes on order_number alone.
        FOR index_record IN
          SELECT i.indexrelid::regclass AS index_name
          FROM pg_index i
          JOIN pg_class t ON t.oid = i.indrelid
          JOIN pg_namespace n ON n.oid = t.relnamespace
          WHERE n.nspname = 'public'
            AND t.relname = 'orders'
            AND i.indisunique
            AND i.indisprimary = FALSE
            AND i.indnkeyatts = 1
            AND NOT EXISTS (
              SELECT 1
              FROM pg_constraint c
              WHERE c.conindid = i.indexrelid
            )
            AND (
              SELECT a.attname
              FROM unnest(i.indkey::smallint[])
                   WITH ORDINALITY AS key_column(attnum, position)
              JOIN pg_attribute a
                ON a.attrelid = t.oid
               AND a.attnum = key_column.attnum
              WHERE key_column.position = 1
            ) = 'order_number'
        LOOP
          EXECUTE format(
            'DROP INDEX IF EXISTS %s',
            index_record.index_name
          );
        END LOOP;
      END $$;
    `);

    await tx.query(`
      ALTER TABLE public.orders
      ALTER COLUMN business_day SET NOT NULL;
    `);

    await tx.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS
      orders_business_day_order_number_key
      ON public.orders (business_day, order_number);
    `);
  });

  console.log('[Migration] All tables, indexes, and constraints successfully applied.');
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigrations()
    .then(() => {
      console.log('[Migration] Schema migration completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migration Error] Migration failed:', err);
      process.exit(1);
    });
}
