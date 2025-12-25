CREATE TABLE IF NOT EXISTS product_buy_together (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buy_together_product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_buy_together_pair UNIQUE (product_id, buy_together_product_id),
    CHECK (product_id <> buy_together_product_id)
);