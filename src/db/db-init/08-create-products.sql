CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  general_category VARCHAR(255),
  vendor VARCHAR(255),
  free_shipping BOOLEAN DEFAULT FALSE,
  available VARCHAR(50) DEFAULT 'in',
  sold INT DEFAULT 0,
  items_in_stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
