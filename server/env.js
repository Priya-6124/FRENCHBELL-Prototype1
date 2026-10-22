import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine active .env path: check root project folder, cwd, then server folder
const candidatePaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '.env'),
];

export const envPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[0];
export const envExists = fs.existsSync(envPath);

// In test mode, never load .env — the test suite manages its own env vars.
// Loading .env would overwrite intentionally deleted vars (e.g. DATABASE_URL)
// and cause tests to hit the live production database instead of pg-mem.
export const dotenvResult =
  process.env.NODE_ENV === 'test'
    ? { parsed: {} }
    : dotenv.config({ path: envPath });

export default dotenvResult;
