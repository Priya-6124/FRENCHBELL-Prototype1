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
  await db.transaction(async (tx) => {
    // Execute SQL script
    await tx.query(schemaSql);
  });

  console.log('[Migration] All tables, indexes, and constraints successfully applied.');
  return true;
}

// If executed directly from command line
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
