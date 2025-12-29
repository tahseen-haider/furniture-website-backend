import { pool } from '#config';

export async function getAllProducts() {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
  return rows;
}

export async function getProductById(id) {
  const client = await pool.connect();
  try {
    const { rows: productRows } = await client.query(
      `SELECT * FROM products WHERE id = $1`,
      [id]
    );
    const product = productRows[0];
    if (!product) return null;

    const { rows: categoryRows } = await client.query(
      `SELECT c.slug
       FROM categories c
       JOIN product_categories pc ON c.id = pc.category_id
       WHERE pc.product_id = $1`,
      [id]
    );
    const categories = categoryRows.map((r) => r.slug);

    const { rows: imageRows } = await client.query(
      `SELECT image_url FROM product_images WHERE product_id = $1`,
      [id]
    );
    const images = imageRows.map((r) => r.image_url);

    const { rows: variantRows } = await client.query(
      `SELECT variant_id, title, price FROM product_variants WHERE product_id = $1`,
      [id]
    );
    const variants = variantRows.map((r) => ({
      id: r.variant_id,
      title: r.title,
      price: r.price,
    }));

    const prices = variants.map((v) => v.price);
    const price = prices.length
      ? [Math.min(...prices), Math.max(...prices)]
      : [];

    const { rows: featureRows } = await client.query(
      `SELECT feature_text FROM product_features WHERE product_id = $1`,
      [id]
    );
    const features = featureRows.map((r) => r.feature_text);

    const { rows: buyTogetherRows } = await client.query(
      `SELECT p.id, p.title, p.vendor
       FROM product_buy_together bt
       JOIN products p ON bt.buy_together_product_id = p.id
       WHERE bt.product_id = $1`,
      [id]
    );

    const buyTogether = await Promise.all(
      buyTogetherRows.map(async (bt) => {
        const { rows: btVariants } = await client.query(
          `SELECT variant_id, title, price FROM product_variants WHERE product_id = $1`,
          [bt.id]
        );
        const { rows: btImages } = await client.query(
          `SELECT image_url FROM product_images WHERE product_id = $1`,
          [bt.id]
        );
        return {
          id: bt.id,
          title: bt.title,
          price: Math.min(...btVariants.map((v) => v.price)),
          images: btImages.map((i) => i.image_url),
          variants: btVariants.map((v) => ({
            id: v.variant_id,
            title: v.title,
            price: v.price,
          })),
        };
      })
    );

    const { rows: relatedRows } = await client.query(
      `SELECT p.id, p.title, p.vendor
       FROM product_related r
       JOIN products p ON r.related_product_id = p.id
       WHERE r.product_id = $1`,
      [id]
    );

    const relatedProducts = await Promise.all(
      relatedRows.map(async (rp) => {
        const { rows: rpVariants } = await client.query(
          `SELECT variant_id, title, price FROM product_variants WHERE product_id = $1`,
          [rp.id]
        );
        const { rows: rpImages } = await client.query(
          `SELECT image_url FROM product_images WHERE product_id = $1`,
          [rp.id]
        );
        return {
          id: rp.id,
          title: rp.title,
          price: rpVariants.length
            ? [
                Math.min(...rpVariants.map((v) => v.price)),
                Math.max(...rpVariants.map((v) => v.price)),
              ]
            : [],
          images: rpImages.map((i) => i.image_url),
          variants: rpVariants.map((v) => ({
            id: v.variant_id,
            title: v.title,
            price: v.price,
          })),
        };
      })
    );

    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      generalCategory: product.general_category,
      vendor: product.vendor,
      description: product.description,
      features,
      categories,
      images,
      freeShipping: product.free_shipping,
      available: product.available,
      sold: product.sold,
      itemsInStock: product.items_in_stock,
      createdAt: product.created_at,
      variants,
      price,
      buyTogether,
      relatedProducts,
    };
  } finally {
    client.release();
  }
}

export const updateProductById = async (id, product) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      UPDATE products
      SET title=$1, slug=$2, description=$3, general_category=$4,
          vendor=$5, free_shipping=$6, available=$7,
          items_in_stock=$8, updated_at=NOW()
      WHERE id=$9
      RETURNING *
      `,
      [
        product.title,
        product.slug,
        product.description,
        product.generalCategory,
        product.vendor,
        product.freeShipping,
        product.available,
        product.itemsInStock,
        id,
      ]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

export const deleteProductRelations = async (client, productId) => {
  const tables = [
    'product_categories',
    'product_variants',
    'product_images',
    'product_features',
    'product_buy_together',
  ];

  for (const table of tables) {
    await client.query(`DELETE FROM ${table} WHERE product_id=$1`, [productId]);
  }
};

export async function createProductBase(client, product) {
  const {
    title,
    slug,
    description,
    generalCategory,
    vendor,
    freeShipping = false,
    available = 'in',
    itemsInStock = 0,
  } = product;

  const { rows } = await client.query(
    `
    INSERT INTO products
    (title, slug, description, general_category, vendor, free_shipping, available, items_in_stock)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
    `,
    [
      title,
      slug,
      description,
      generalCategory,
      vendor,
      freeShipping,
      available,
      itemsInStock,
    ]
  );

  return rows[0];
}

export const attachCategories = async (client, productId, categorySlugs) => {
  if (!categorySlugs?.length) return;

  const { rows } = await client.query(
    `SELECT id, slug FROM categories WHERE slug = ANY($1)`,
    [categorySlugs]
  );

  const foundSlugs = rows.map((r) => r.slug);
  const missingSlugs = categorySlugs.filter(
    (slug) => !foundSlugs.includes(slug)
  );

  if (missingSlugs.length) {
    throw new Error(`Invalid category slugs: ${missingSlugs.join(', ')}`);
  }

  for (const c of rows) {
    await client.query(
      `INSERT INTO product_categories (product_id, category_id)
       VALUES ($1,$2)
       ON CONFLICT DO NOTHING`,
      [productId, c.id]
    );
  }
};

export async function attachVariants(client, productId, variants) {
  if (!variants?.length) {
    throw new Error('Product must have at least one variant');
  }

  for (const v of variants) {
    if (v.price <= 0) {
      throw new Error('Variant price must be > 0');
    }

    await client.query(
      `
      INSERT INTO product_variants (product_id, variant_id, title, price)
      VALUES ($1,$2,$3,$4)
      `,
      [productId, v.variantId, v.title, v.price]
    );
  }
}

export async function attachImages(client, productId, images = []) {
  for (const url of images) {
    await client.query(
      `
      INSERT INTO product_images (product_id, image_url)
      VALUES ($1,$2)
      `,
      [productId, url]
    );
  }
}

export async function attachFeatures(client, productId, features = []) {
  for (const f of features) {
    await client.query(
      `
      INSERT INTO product_features (product_id, feature_text)
      VALUES ($1,$2)
      `,
      [productId, f]
    );
  }
}

export async function attachBuyTogether(client, productId, buyTogether = []) {
  if (buyTogether.length > 2) {
    throw new Error('Max 2 buy together products allowed');
  }

  for (const btId of buyTogether) {
    if (btId === productId) continue;

    await client.query(
      `
      INSERT INTO product_buy_together (product_id, buy_together_product_id)
      VALUES ($1,$2)
      `,
      [productId, btId]
    );
  }
}

export async function regenerateRelatedProducts(client, productId) {
  await client.query(`DELETE FROM product_related WHERE product_id = $1`, [
    productId,
  ]);

  await client.query(
    `
    INSERT INTO product_related (product_id, related_product_id)
    SELECT
      $1,
      p2.id
    FROM product_categories pc1
    JOIN product_categories pc2
      ON pc1.category_id = pc2.category_id
    JOIN products p2
      ON pc2.product_id = p2.id
    WHERE pc1.product_id = $1
      AND p2.id != $1
    GROUP BY p2.id
    ORDER BY COUNT(*) DESC
    LIMIT 6
    `,
    [productId]
  );
}

export async function createProduct(client, product) {
  const {
    title,
    slug,
    description,
    generalCategory,
    vendor,
    freeShipping,
    available,
    itemsInStock,
  } = product;

  const { rows } = await client.query(
    `INSERT INTO products
     (title, slug, description, general_category, vendor, free_shipping, available, items_in_stock)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      title,
      slug,
      description,
      generalCategory,
      vendor,
      freeShipping,
      available,
      itemsInStock,
    ]
  );
  return rows[0];
}

export async function updateProduct(client, id, product) {
  const {
    title,
    slug,
    description,
    generalCategory,
    vendor,
    freeShipping,
    available,
    itemsInStock,
  } = product;

  const { rows } = await client.query(
    `UPDATE products
     SET title=$1, slug=$2, description=$3, general_category=$4, vendor=$5,
         free_shipping=$6, available=$7, items_in_stock=$8, updated_at=NOW()
     WHERE id=$9 RETURNING *`,
    [
      title,
      slug,
      description,
      generalCategory,
      vendor,
      freeShipping,
      available,
      itemsInStock,
      id,
    ]
  );
  return rows[0];
}

export const deleteProductById = async (client, id) => {
  const { rowCount } = await client.query(
    'DELETE FROM products WHERE id=$1 RETURNING id',
    [id]
  );
  if (rowCount === 0) {
    throw new Error('Product not found');
  }
};
