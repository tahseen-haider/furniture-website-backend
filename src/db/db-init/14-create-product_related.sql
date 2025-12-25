CREATE TABLE IF NOT EXISTS product_related (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    related_product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_related_pair UNIQUE (product_id, related_product_id),
    CHECK (product_id <> related_product_id)
);