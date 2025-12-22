CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT NULL,
  tracking_id BIGINT UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  estimated_delivery DATE,

  region VARCHAR(50),

  shipping_address_id INT REFERENCES addresses(id) ON DELETE SET NULL,
  billing_address_id INT REFERENCES addresses(id) ON DELETE SET NULL,
  billing_same_as_shipping BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW()
);
