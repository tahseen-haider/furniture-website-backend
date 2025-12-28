import { pool } from '#config';
import {
  createProductBase,
  attachCategories,
  attachVariants,
  attachImages,
  attachFeatures,
  attachBuyTogether,
  regenerateRelatedProducts,
  getAllProducts,
  getProductById,
  deleteProductRelations,
  updateProductById,
  deleteProductById,
} from '#models';
import { validateCreateProductPayload } from '#validators';

export const fetchProductsByCategoryService = async ({
  category,
  price_min,
  price_max,
  sort = 'best-selling',
  page = 1,
  pageSize = 12,
  available,
}) => {
  const client = await pool.connect();

  try {
    const offset = (page - 1) * pageSize;

    const baseParams = [
      Number.isFinite(price_min) ? price_min : null,
      Number.isFinite(price_max) ? price_max : null,
      category,
    ];

    const countQuery = `
      WITH filtered_variants AS (
        SELECT *
        FROM product_variants
        WHERE
          ($1::numeric IS NULL OR price >= $1)
          AND ($2::numeric IS NULL OR price <= $2)
      )
      SELECT COUNT(*) FROM (
        SELECT p.id
        FROM products p
        JOIN product_categories pc ON p.id = pc.product_id
        JOIN categories c ON pc.category_id = c.id
        JOIN filtered_variants fv ON p.id = fv.product_id
        WHERE c.slug = $3
        GROUP BY p.id
      ) sub;
    `;

    const { rows: countRows } = await client.query(countQuery, baseParams);
    const totalItems = Number(countRows[0].count);
    const totalPages = Math.ceil(totalItems / pageSize);

    const queryParams = [...baseParams, sort, pageSize, offset, available];

    const query = `
      WITH filtered_variants AS (
        SELECT *
        FROM product_variants
        WHERE
          ($1::numeric IS NULL OR price >= $1)
          AND ($2::numeric IS NULL OR price <= $2)
      )
      SELECT *
      FROM (
        SELECT
          p.id,
          p.title,
          p.slug,
          ARRAY_AGG(DISTINCT pi.image_url) AS images,
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'id', fv.variant_id,
              'title', fv.title,
              'price', fv.price
            )
          ) AS variants,
          MIN(fv.price) AS min_price,
          MAX(fv.price) AS max_price,
          p.created_at,
          p.sold
        FROM products p
        JOIN product_categories pc ON p.id = pc.product_id
        JOIN categories c ON pc.category_id = c.id
        JOIN filtered_variants fv ON p.id = fv.product_id
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE c.slug = $3 AND p.available = $7
        GROUP BY p.id
      ) sub
      ORDER BY
        CASE WHEN $4 = 'title-ascending' THEN sub.title END ASC,
        CASE WHEN $4 = 'title-descending' THEN sub.title END DESC,
        CASE WHEN $4 = 'price-ascending' THEN sub.min_price END ASC,
        CASE WHEN $4 = 'price-descending' THEN sub.min_price END DESC,
        CASE WHEN $4 = 'created-ascending' THEN sub.created_at END ASC,
        CASE WHEN $4 = 'created-descending' THEN sub.created_at END DESC,
        CASE WHEN $4 = 'best-selling' THEN sub.sold END DESC
      LIMIT $5 OFFSET $6;
    `;

    const { rows } = await client.query(query, queryParams);

    return {
      products: rows.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        images: r.images ?? [],
        variants: r.variants ?? [],
        price: [Number(r.min_price), Number(r.max_price)],
      })),
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  } finally {
    client.release();
  }
};

export const fetchProductsService = async () => {
  return getAllProducts();
};

export const fetchProductService = async (id) => {
  return getProductById(id);
};

export const fetchProductsAdminService = async () => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.vendor,
        p.available,
        p.sold,
        p.items_in_stock,
        p.created_at,
        ARRAY_AGG(DISTINCT c.slug) AS categories,
        MIN(v.price) AS min_price,
        MAX(v.price) AS max_price
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN product_variants v ON p.id = v.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      vendor: r.vendor,
      categories: r.categories || [],
      price: [Number(r.min_price), Number(r.max_price)],
      available: r.available,
      sold: r.sold,
      itemsInStock: r.items_in_stock,
      createdAt: r.created_at,
    }));
  } finally {
    client.release();
  }
};

export const createProductService = async (payload) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { product, categories, variants, images, features, buyTogether } =
      payload;

    const { rows: existingProducts } = await client.query(
      'SELECT id FROM products WHERE slug = $1',
      [product.slug]
    );

    if (existingProducts.length > 0) {
      await client.query('ROLLBACK');
      return { exists: true, id: existingProducts[0].id };
    }

    const createdProduct = await createProductBase(client, product);

    await attachCategories(client, createdProduct.id, categories);
    await attachVariants(client, createdProduct.id, variants);
    await attachImages(client, createdProduct.id, images);
    await attachFeatures(client, createdProduct.id, features);
    await attachBuyTogether(client, createdProduct.id, buyTogether);

    await regenerateRelatedProducts(client, createdProduct.id);

    await client.query('COMMIT');
    return { exists: false, product: createdProduct };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updateProductService = async (id, payload) => {
  const validation = validateCreateProductPayload(payload);
  if (validation.errors.length) {
    return { errors: validation.errors };
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const product = await updateProductById(id, payload.product);
    if (!product) {
      await client.query('ROLLBACK');
      return null;
    }

    await deleteProductRelations(client, id);

    await attachCategories(client, id, payload.categories);
    await attachVariants(client, id, payload.variants);
    await attachImages(client, id, payload.images);
    await attachFeatures(client, id, payload.features);
    await attachBuyTogether(client, id, payload.buyTogether);

    await regenerateRelatedProducts(client, id);

    await client.query('COMMIT');
    return product;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const deleteProductService = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await deleteProductById(client, id);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
