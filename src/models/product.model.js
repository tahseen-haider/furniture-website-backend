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
      product: {
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
      },
    };
  } finally {
    client.release();
  }
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

export async function deleteProduct(client, id) {
  await client.query('DELETE FROM products WHERE id=$1', [id]);
}
