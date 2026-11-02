-- NovaReserve SQLite Database Schema
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('admin', 'customer')),
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  tag TEXT,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 60,
  image_url TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  highlights TEXT, -- JSON array of strings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS availability_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER, -- NULL means default for all services
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday...
  start_time TEXT NOT NULL, -- "09:00"
  end_time TEXT NOT NULL,   -- "18:00"
  slot_interval_min INTEGER NOT NULL DEFAULT 60,
  FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_ref TEXT UNIQUE NOT NULL,
  user_id INTEGER,
  service_id INTEGER NOT NULL,
  booking_date TEXT NOT NULL, -- "YYYY-MM-DD"
  start_time TEXT NOT NULL,   -- "HH:MM"
  end_time TEXT NOT NULL,     -- "HH:MM"
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  guests_count INTEGER DEFAULT 1,
  special_requests TEXT,
  add_ons TEXT, -- JSON array of objects: [{ name, price }]
  total_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK(payment_status IN ('paid', 'pay_at_arrival')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  booking_id INTEGER,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
