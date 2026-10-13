import getDb, {
  getCafeBusinessDay,
  canTransitionOrderStatus,
  VALID_ORDER_STATUS_TRANSITIONS,
  convertPlaceholders,
  initDatabase
} from './db/index.js';

export async function generateNextOrderNumber() {
  const db = await getDb();
  return await db.generateNextOrderNumber();
}

export {
  getCafeBusinessDay,
  canTransitionOrderStatus,
  VALID_ORDER_STATUS_TRANSITIONS,
  convertPlaceholders,
  initDatabase
};

export default getDb;
