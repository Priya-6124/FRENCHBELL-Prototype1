-- MySQL & SQLite Schema for French Bell Cafe Database

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer', -- 'customer', 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  active TINYINT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  veg_type VARCHAR(20) DEFAULT 'veg', -- 'veg', 'non-veg'
  price DECIMAL(10, 2) NOT NULL,
  price_chicken DECIMAL(10, 2) DEFAULT NULL,
  price_veg DECIMAL(10, 2) DEFAULT NULL,
  available TINYINT DEFAULT 1,
  popular TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT,
  order_type VARCHAR(20) NOT NULL, -- 'dine-in', 'takeaway', 'delivery'
  table_number VARCHAR(20),
  num_people INT,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  pickup_time VARCHAR(50),
  delivery_address TEXT,
  landmark VARCHAR(255),
  pincode VARCHAR(20),
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  delivery_charge DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  payment_method VARCHAR(50) DEFAULT 'upi',
  order_status VARCHAR(50) DEFAULT 'received', -- 'received', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'
  special_instructions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  variant VARCHAR(50), -- e.g., 'Chicken' or 'Veg' for Momos
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INT NOT NULL,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  coupon_code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
  discount_value DECIMAL(10, 2) NOT NULL,
  minimum_order DECIMAL(10, 2) DEFAULT 0.00,
  start_date VARCHAR(50),
  end_date VARCHAR(50),
  active TINYINT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS advertisements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  cta VARCHAR(100),
  start_date VARCHAR(50),
  end_date VARCHAR(50),
  active TINYINT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  read_status TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receipts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INT NOT NULL,
  pdf_url TEXT,
  whatsapp_status VARCHAR(50) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);
