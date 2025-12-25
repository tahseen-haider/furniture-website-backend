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
  sort,
  page = 1,
  pageSize = 12,
}) => {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * pageSize;

    let whereClauses = ['1=1'];
    const params = [];
    let idx = 1;

    if (category) {
      whereClauses.push(`c.slug = $${idx++}`);
      params.push(category);
    }

    if (price_min) {
      whereClauses.push(`p.id IN (
        SELECT pv.product_id FROM product_variants pv WHERE pv.price >= $${idx++}
      )`);
      params.push(price_min);
    }

    if (price_max) {
      whereClauses.push(`p.id IN (
        SELECT pv.product_id FROM product_variants pv WHERE pv.price <= $${idx++}
      )`);
      params.push(price_max);
    }

    let orderBy = 'p.title ASC';
    if (sort === 'title-descending') orderBy = 'p.title DESC';
    else if (sort === 'price-ascending') orderBy = 'MIN(pv.price) ASC';
    else if (sort === 'price-descending') orderBy = 'MAX(pv.price) DESC';

    const countQuery = `
      SELECT COUNT(DISTINCT p.id) AS total
      FROM products p
      JOIN product_categories pc ON p.id = pc.product_id
      JOIN categories c ON pc.category_id = c.id
      JOIN product_variants pv ON p.id = pv.product_id
      WHERE ${whereClauses.join(' AND ')}
    `;
    const { rows: countRows } = await client.query(countQuery, params);
    const totalItems = parseInt(countRows[0].total, 10);
    const totalPages = Math.ceil(totalItems / pageSize);

    const query = `
      SELECT
        p.id,
        p.title,
        p.slug,
        p.general_category,
        p.vendor,
        ARRAY_AGG(DISTINCT pi.image_url) AS images,
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'id', pv.variant_id,
          'title', pv.title,
          'price', pv.price
        )) AS variants,
        ARRAY_AGG(DISTINCT pv.price) AS price
      FROM products p
      JOIN product_categories pc ON p.id = pc.product_id
      JOIN categories c ON pc.category_id = c.id
      JOIN product_variants pv ON p.id = pv.product_id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY p.id
      ORDER BY ${orderBy}
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    params.push(pageSize, offset);
    const { rows } = await client.query(query, params);

    return {
      products: rows.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        images: r.images || [],
        variants: r.variants || [],
        price: r.price ? [Math.min(...r.price), Math.max(...r.price)] : [],
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

export const createProductService = async (payload) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { product, categories, variants, images, features, buyTogether } =
      payload;

    const createdProduct = await createProductBase(client, product);

    await attachCategories(client, createdProduct.id, categories);
    await attachVariants(client, createdProduct.id, variants);
    await attachImages(client, createdProduct.id, images);
    await attachFeatures(client, createdProduct.id, features);
    await attachBuyTogether(client, createdProduct.id, buyTogether);

    await regenerateRelatedProducts(client, createdProduct.id);

    await client.query('COMMIT');
    return createdProduct;
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
