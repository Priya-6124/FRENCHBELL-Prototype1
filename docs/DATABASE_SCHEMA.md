# FrenchBell Cafe — Database Schema Reference

**Database Engine:** PostgreSQL 13+  
**Schema file:** `server/db/schema.sql`  
**Database module:** `server/db/index.js`  
**Migration runner:** `server/db/migrate.js`  
**JSON data importer:** `server/db/importJson.js`

---

## Overview

All persistent data for FrenchBell Cafe is stored in a single PostgreSQL database. There is no fallback to JSON file storage; if the database connection fails the server will return 503 errors.

The schema uses `CREATE TABLE IF NOT EXISTS` so running migrations repeatedly is safe.

---

## Tables

### 1. `users`
Stores both **customers** (authenticated via mobile OTP) and **administrators** (authenticated via email + password).

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | Auto-increment |
| `name` | VARCHAR(255) NOT NULL | Display name |
| `phone` | VARCHAR(50) UNIQUE | 10-digit mobile (customers only) |
| `email` | VARCHAR(255) UNIQUE | Email address (admins only) |
| `password_hash` | VARCHAR(255) NOT NULL | bcrypt hash |
| `role` | VARCHAR(50) | `'customer'` or `'admin'` |
| `status` | VARCHAR(50) | `'active'`, `'suspended'`, `'removed'` |
| `suspend_reason` | TEXT | Populated on suspension |
| `remove_reason` | TEXT | Populated on soft-deletion |
| `suspended_at` | TIMESTAMPTZ | When suspended |
| `suspended_by` | INT FK → users(id) | Actor who suspended |
| `removed_at` | TIMESTAMPTZ | When soft-deleted |
| `removed_by` | INT FK → users(id) | Actor who removed |
| `whatsapp_opt_in` | SMALLINT | 1 = opted in, 0 = opted out |
| `created_at` | TIMESTAMPTZ | Auto |
| `updated_at` | TIMESTAMPTZ | Auto |

**Indexes:** `idx_users_phone`, `idx_users_email` (lowercased), `idx_users_role`, `idx_users_status`

---

### 2. `menu_categories`
Organises menu items into sections (e.g. Starters, Burgers, Beverages).

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `name` | VARCHAR(100) NOT NULL | Display name |
| `slug` | VARCHAR(100) UNIQUE NOT NULL | URL-safe identifier |
| `display_order` | INT | Ordering on menu page |
| `active` | SMALLINT | 1 = visible |
| `created_at` | TIMESTAMPTZ | |

---

### 3. `menu_items`
Individual food and beverage items. Supports optional variant pricing (veg/chicken).

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `category_id` | INT FK → menu_categories(id) CASCADE | |
| `name` | VARCHAR(255) NOT NULL | |
| `description` | TEXT | |
| `image_url` | TEXT | |
| `veg_type` | VARCHAR(20) | `'veg'` or `'non-veg'` |
| `price` | NUMERIC(10,2) NOT NULL | Default price |
| `price_chicken` | NUMERIC(10,2) | Chicken variant price |
| `price_veg` | NUMERIC(10,2) | Veg variant price |
| `available` | SMALLINT | 1 = in stock |
| `popular` | SMALLINT | 1 = featured |
| `stock_quantity` | INT | Current units available |
| `prep_time_mins` | INT | Estimated preparation time |
| `is_special` | SMALLINT | Chef's special flag |
| `is_recommended` | SMALLINT | Recommended flag |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

---

### 4. `customer_otps`
Temporary OTP records used for customer mobile verification. Single-row per phone number (upserted).

| Column | Type | Notes |
|---|---|---|
| `phone` | VARCHAR(50) PK | 10-digit mobile |
| `hashed_otp` | VARCHAR(255) NOT NULL | SHA-256 HMAC hash of OTP |
| `expires_at` | BIGINT NOT NULL | Unix timestamp (ms) |
| `attempts` | INT | Number of failed verification attempts |
| `cooldown_until` | BIGINT NOT NULL | Unix timestamp; resend blocked until this |
| `created_at` | TIMESTAMPTZ | |

> **Security:** Raw OTP values are never stored. The hash combines `phone:otp:JWT_SECRET`.

---

### 5. `orders`
Customer orders created at checkout. Payment status and fulfilment status are separate columns.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `order_number` | VARCHAR(50) UNIQUE NOT NULL | e.g. `FB001`, `FB002` |
| `user_id` | INT FK → users(id) SET NULL | Nullable for legacy orders |
| `order_type` | VARCHAR(20) NOT NULL | `'dine-in'`, `'takeaway'`, `'delivery'` |
| `table_number` | VARCHAR(20) | Dine-in only |
| `num_people` | INT | Dine-in only |
| `customer_name` | VARCHAR(255) NOT NULL | |
| `phone` | VARCHAR(50) NOT NULL | |
| `pickup_time` | VARCHAR(50) | Takeaway only |
| `delivery_address` | TEXT | Delivery only |
| `landmark` / `pincode` | VARCHAR | Delivery only |
| `subtotal` | NUMERIC(10,2) NOT NULL | Before discount and tax |
| `discount` | NUMERIC(10,2) | Coupon discount applied |
| `delivery_charge` | NUMERIC(10,2) | 0 for non-delivery |
| `tax` | NUMERIC(10,2) | GST amount (5%) |
| `total` | NUMERIC(10,2) NOT NULL | Grand total payable |
| `payment_status` | VARCHAR(50) | `'pending'`, `'successful'`, `'failed'`, `'refunded'` |
| `payment_method` | VARCHAR(50) | `'simulated'`, `'cash'`, etc. |
| `order_status` | VARCHAR(50) | `'received'` → `'accepted'` → `'preparing'` → `'ready'` → `'out_for_delivery'` → `'completed'` / `'cancelled'` |
| `special_instructions` | TEXT | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

**Indexes:** `order_number`, `user_id`, `phone`, `order_status`, `payment_status`, `created_at`

---

### 6. `order_items`
Line items belonging to each order. Prices are snapshotted at the time of order.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `order_id` | INT FK → orders(id) CASCADE | |
| `menu_item_id` | INT FK → menu_items(id) SET NULL | Nullable if item was deleted |
| `item_name` | VARCHAR(255) NOT NULL | Snapshotted name |
| `variant` | VARCHAR(50) | `'Veg'`, `'Chicken'`, or NULL |
| `quantity` | INT NOT NULL | |
| `unit_price` | NUMERIC(10,2) NOT NULL | Authoritative price at order time |
| `total_price` | NUMERIC(10,2) NOT NULL | `unit_price × quantity` |
| `special_instructions` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

---

### 7. `order_status_history`
Append-only audit trail of every status transition for each order.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `order_id` | INT FK → orders(id) CASCADE | |
| `previous_status` | VARCHAR(50) | NULL for initial entry |
| `new_status` | VARCHAR(50) NOT NULL | |
| `changed_by` | VARCHAR(255) | Admin name or `'Payment Service (Simulated)'` |
| `change_reason` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

---

### 8. `payments`
One record per payment attempt. Multiple attempts may exist for one order (success after failure).

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `order_id` | INT FK → orders(id) CASCADE | |
| `transaction_id` | VARCHAR(100) UNIQUE NOT NULL | e.g. `SIM_TXN_1234_ABCD` |
| `provider` | VARCHAR(50) | `'simulated'` (current), `'razorpay'` (future) |
| `amount` | NUMERIC(10,2) NOT NULL | |
| `currency` | VARCHAR(10) | `'INR'` |
| `method` | VARCHAR(50) NOT NULL | e.g. `'simulated_upi_gpay'`, `'cash'` |
| `status` | VARCHAR(50) | `'pending'`, `'successful'`, `'failed'`, `'refunded'` |
| `error_message` | TEXT | Set on failed attempts |
| `raw_response` | TEXT | JSON payload from provider |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

---

### 9. `receipts`
One record per order after successful payment. Tracks receipt delivery status.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `order_id` | INT FK → orders(id) CASCADE | |
| `receipt_number` | VARCHAR(100) UNIQUE NOT NULL | e.g. `RCP_FB001` |
| `destination_phone` | VARCHAR(50) | `RECEIPT_DISPATCH_PHONE_NUMBER` env var |
| `delivery_status` | VARCHAR(50) | `'unconfigured'` (current — no SMS/WA provider) |
| `provider` | VARCHAR(50) | `'none'` until messaging configured |
| `delivery_message` | TEXT | Human-readable status message |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

---

### 10. `admin_invitations`
Secure single-use invitation tokens for onboarding new administrators.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `email` | VARCHAR(255) NOT NULL | Recipient email; locked to invitation |
| `token` | VARCHAR(255) UNIQUE NOT NULL | 64-char hex cryptographic token |
| `status` | VARCHAR(50) | `'pending'`, `'accepted'`, `'cancelled'`, `'expired'` |
| `invited_by` | VARCHAR(255) NOT NULL | Actor's email |
| `invited_by_name` | VARCHAR(255) | Actor's display name |
| `expires_at` | TIMESTAMPTZ NOT NULL | 72 hours from creation |
| `last_resent_at` | TIMESTAMPTZ | Updated on resend (token rotated) |
| `accepted_at` | TIMESTAMPTZ | Set when accepted |
| `cancelled_at` | TIMESTAMPTZ | Set when cancelled |
| `created_at` | TIMESTAMPTZ | |

> **Security:** Tokens are consumed atomically inside a database transaction. Accepted tokens cannot be reused. Cancelled invitations cannot be accepted.

---

### 11. `activity_logs`
Append-only security and audit register. Admins cannot delete records through normal operations.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `admin_id` | INT FK → users(id) SET NULL | NULL for system events |
| `admin_email` | VARCHAR(255) | Recorded at log time (not FK) |
| `admin_name` | VARCHAR(255) | Recorded at log time |
| `action` | VARCHAR(100) NOT NULL | e.g. `'Suspended Admin'`, `'Updated Order Status'` |
| `entity` | VARCHAR(100) | e.g. `'admin_user'`, `'order'`, `'admin_invitation'` |
| `entity_id` | VARCHAR(100) | Primary key of affected record |
| `details` | TEXT | Human-readable event description |
| `reason` | TEXT | Mandatory reason for destructive actions |
| `metadata` | JSONB | Optional structured payload |
| `created_at` | TIMESTAMPTZ | Auto |

> **Security:** Passwords, OTPs, session tokens, and invitation tokens are never logged.

---

### 12. `settings`
Key-value store for operational cafe settings (tax rate, delivery fees, business hours, etc.)

| Column | Type | Notes |
|---|---|---|
| `key` | VARCHAR(100) PK | Setting identifier |
| `value` | TEXT NOT NULL | String value (JSON for complex types) |
| `updated_at` | TIMESTAMPTZ | |

---

### 13. `offers` (Coupons)

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `coupon_code` | VARCHAR(50) UNIQUE | e.g. `BELL20` |
| `discount_type` | VARCHAR(20) | `'percentage'` or `'fixed'` |
| `discount_value` | NUMERIC(10,2) | |
| `minimum_order` | NUMERIC(10,2) | Minimum cart value to apply |
| `max_discount` | NUMERIC(10,2) | Cap for percentage discounts |
| `applicable_order_type` | VARCHAR(50) | `'all'`, `'delivery'`, `'takeaway'`, `'dine-in'` |
| `active` | SMALLINT | |

---

### 14. `advertisements`
Marketing banners shown on the customer-facing site.

---

### 15. `inventory`
Raw ingredient tracking (linked to menu items via JSONB `linked_dishes` field).

---

### 16. `admin_notifications`
In-app alerts shown on the admin dashboard (new order, low stock, new customer, etc.)

---

### 17. `tables`
Dine-in table registry with QR code URLs.

---

## Valid Order Status Transitions

```
received → accepted | preparing | cancelled
accepted → preparing | cancelled
preparing → ready | cancelled
ready → out_for_delivery | completed | cancelled
out_for_delivery → completed | cancelled
completed → (terminal)
cancelled → (terminal)
```

---

## Example Queries

### All orders for a specific customer
```sql
SELECT * FROM orders
WHERE user_id = 42 OR phone = '9876543210'
ORDER BY created_at DESC;
```

### Order with items and payment details
```sql
SELECT o.*, p.transaction_id, p.status as payment_status, p.method
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.order_number = 'FB001';

SELECT * FROM order_items WHERE order_id = <order_id>;
```

### All active admins with last login
```sql
SELECT id, name, email, status, updated_at as last_seen
FROM users
WHERE role = 'admin' AND status = 'active'
ORDER BY updated_at DESC;
```

### Pending invitations
```sql
SELECT id, email, invited_by_name, expires_at, last_resent_at
FROM admin_invitations
WHERE status = 'pending' AND expires_at > NOW();
```

### Activity log for admin suspensions
```sql
SELECT al.*, u.email as target_email
FROM activity_logs al
WHERE action = 'Suspended Admin'
ORDER BY created_at DESC;
```

### Revenue by order type (today)
```sql
SELECT order_type, COUNT(*) as orders, SUM(total) as revenue
FROM orders
WHERE payment_status = 'successful'
  AND created_at >= CURRENT_DATE
GROUP BY order_type;
```

---

## Migration

Run schema migrations (idempotent — safe to run multiple times):
```bash
npm run migrate
```

This executes `server/db/migrate.js` which reads `server/db/schema.sql` and applies all `CREATE TABLE IF NOT EXISTS` statements against the configured PostgreSQL database.

---

## Importing Existing JSON Data

If you have historical data in `server/frenchbell_db.json`:
```bash
npm run import-json
```

The importer uses `ON CONFLICT ... DO NOTHING` / `DO UPDATE` so it will not overwrite existing records with the same primary keys. It is safe to run against a populated database.

---

## Backup

```bash
# Full database dump
pg_dump -U frenchbell -d frenchbell_db -F c -f backup_$(date +%Y%m%d).dump

# Restore from dump
pg_restore -U frenchbell -d frenchbell_db backup_20260101.dump
```

---

## Database Inspection

### psql CLI
```bash
psql -U frenchbell -d frenchbell_db

# List tables
\dt

# Describe a table
\d orders

# Count records
SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;
```

### pgAdmin (GUI)
1. Install pgAdmin 4 from https://www.pgadmin.org/download/
2. Add server: Host `localhost`, Port `5432`, Database `frenchbell_db`
3. Navigate: Servers → frenchbell → Databases → frenchbell_db → Schemas → Tables

### TablePlus / DBeaver
Connect using the `DATABASE_URL` from your `.env` file.
