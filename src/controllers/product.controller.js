import {
  fetchProductsService,
  fetchProductService,
  createProductService,
  fetchProductsAdminService,
  updateProductService,
  deleteProductService,
  fetchProductsByCategoryService,
} from '#services';
import { validateCreateProductPayload } from '#validators';
import { productsPerPage } from '#config';

export async function getProducts(_req, res) {
  const products = await fetchProductsService();
  res.json({ products });
}

export const getProductsByCategory = async (req, res) => {
  try {
    const {
      price_min,
      price_max,
      sort: sortQuery,
      page,
      available = 'in',
    } = req.query;

    const sort =
      typeof sortQuery === 'string' && sortQuery.length
        ? sortQuery
        : 'title-ascending';

    const priceMin =
      price_min !== undefined && price_min !== ''
        ? Number(price_min)
        : undefined;
    const priceMax =
      price_max !== undefined && price_max !== ''
        ? Number(price_max)
        : undefined;

    const args = {
      category: req.params.category,
      price_min: Number.isFinite(priceMin) ? priceMin : undefined,
      price_max: Number.isFinite(priceMax) ? priceMax : undefined,
      sort,
      page: Number(page) || 1,
      pageSize: productsPerPage || 12,
      available,
    };
    const data = await fetchProductsByCategoryService(args);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

export async function getProductById(req, res) {
  const product = await fetchProductService(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}

export async function createProduct(req, res) {
  const { errors } = validateCreateProductPayload(req.body);

  if (errors.length) {
    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  const result = await createProductService(req.body);

  if (result.exists) {
    return res.status(409).json({
      message: 'Product with this slug already exists',
      productId: result.id,
    });
  }

  res.status(201).json({
    product: result.product,
  });
}

export const getProductsAdmin = async (_req, res) => {
  try {
    const products = await fetchProductsAdminService();
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products for admin' });
  }
};

export async function updateProduct(req, res) {
  const { errors } = validateCreateProductPayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const product = await updateProductService(req.params.id, req.body);

  if (product === null) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (product.errors) {
    return res.status(400).json({ errors: product.errors });
  }

  res.json(product);
}

export async function deleteProduct(req, res) {
  await deleteProductService(req.params.id);
  res.json({ message: 'Product deleted' });
}
