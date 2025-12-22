CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  product_id INT,
  variant_id VARCHAR(100),
  title TEXT NOT NULL,
  variant_title TEXT,
  image TEXT,
  price INT NOT NULL,
  quantity INT NOT NULL,
  free_shipping BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);
