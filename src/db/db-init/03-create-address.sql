CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code VARCHAR(20),
  phone VARCHAR(30),
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
