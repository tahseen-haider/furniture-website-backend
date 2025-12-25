import {
  fetchProductsService,
  fetchProductService,
  createProductService,
  updateProductService,
  deleteProductService,
  fetchProductsByCategoryService,
} from '#services';
import { validateCreateProductPayload } from '#validators';

export async function getProducts(_req, res) {
  const products = await fetchProductsService();
  res.json({ products });
}

export const getProductsByCategory = async (req, res) => {
  const { price_min, price_max, sort, page } = req.query;
  const data = await fetchProductsByCategoryService({
    category: req.params.category,
    price_min: price_min ? Number(price_min) : undefined,
    price_max: price_max ? Number(price_max) : undefined,
    sort,
    page: page ? Number(page) : 1,
    pageSize: 12,
  });
  res.json(data);
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

  const product = await createProductService(req.body);

  res.status(201).json({
    product,
  });
}

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
