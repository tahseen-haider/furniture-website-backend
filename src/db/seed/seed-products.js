import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '#config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsDir = path.join(__dirname, '../../constants/product');

async function seedProducts() {
  const { rows: existingProducts } = await pool.query(
    `SELECT id FROM products LIMIT 1`
  );
  if (existingProducts.length > 0) {
    console.log('Products already exist. Skipping seeding.');
    return;
  }

  const files = fs.readdirSync(productsDir).filter((f) => f.endsWith('.json'));
  const productIdMap = {};

  for (const file of files) {
    const data = JSON.parse(
      fs.readFileSync(path.join(productsDir, file), 'utf-8')
    );
    const p = data.product;
    if (!p) {
      console.warn(`Skipping ${file} – no "product" key found`);
      continue;
    }

    const { rows } = await pool.query(
      `INSERT INTO products 
       (title, slug, description, general_category, vendor, free_shipping, available, sold, items_in_stock) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [
        p.title,
        p.slug,
        p.description,
        p.generalCategory,
        p.vendor,
        p.freeShipping,
        p.available,
        p.sold,
        p.itemsInStock,
      ]
    );
    const productId = rows[0].id;
    productIdMap[p.id] = productId;

    for (const img of p.images || []) {
      await pool.query(
        `INSERT INTO product_images (product_id, image_url) VALUES ($1,$2)`,
        [productId, img]
      );
    }

    for (const v of p.variants || []) {
      await pool.query(
        `INSERT INTO product_variants (product_id, variant_id, title, price) VALUES ($1,$2,$3,$4)`,
        [productId, v.id, v.title, v.price]
      );
    }

    for (const cat of p.categories || []) {
      const { rows: catRows } = await pool.query(
        `SELECT id FROM categories WHERE slug=$1`,
        [cat]
      );
      if (catRows[0]) {
        await pool.query(
          `INSERT INTO product_categories (product_id, category_id) VALUES ($1,$2)`,
          [productId, catRows[0].id]
        );
      }
    }

    for (const f of p.features || []) {
      await pool.query(
        `INSERT INTO product_features (product_id, feature_text) VALUES ($1,$2)`,
        [productId, f]
      );
    }

    console.log(`Seeded product (basic data): ${p.title}`);
  }

  for (const file of files) {
    const data = JSON.parse(
      fs.readFileSync(path.join(productsDir, file), 'utf-8')
    );
    const p = data.product;
    if (!p) continue;

    const productId = productIdMap[p.id];

    for (const bt of p.buyTogether || []) {
      if (!productIdMap[bt.id]) continue;
      await pool.query(
        `INSERT INTO product_buy_together (product_id, buy_together_product_id) VALUES ($1,$2)`,
        [productId, productIdMap[bt.id]]
      );
    }

    for (const rp of p.relatedProducts || []) {
      if (!productIdMap[rp.id]) continue;
      await pool.query(
        `INSERT INTO product_related (product_id, related_product_id) VALUES ($1,$2)`,
        [productId, productIdMap[rp.id]]
      );
    }
  }

  console.log('All products seeded successfully!');
}

seedProducts().catch((err) => console.error(err));
