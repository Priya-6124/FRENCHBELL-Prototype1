import { initDatabase } from '../server/db/index.js';

process.env.NODE_ENV = 'test';
delete process.env.DATABASE_URL;
delete process.env.PGHOST;

try {
  const db = await initDatabase();
  const health = await db.checkHealth();
  console.log('Database Health:', health);

  // Check some basic queries
  const users = await db.all('SELECT * FROM users');
  console.log('Users count:', users.length);

  const categories = await db.all('SELECT * FROM menu_categories');
  console.log('Categories count:', categories.length);

  console.log('SUCCESS: pg-mem initialized and executed schema.sql cleanly!');
  process.exit(0);
} catch (err) {
  console.error('FAILED to initialize pg-mem:', err);
  process.exit(1);
}
