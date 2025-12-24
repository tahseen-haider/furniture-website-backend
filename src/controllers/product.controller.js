import {
  fetchProductsService,
  fetchProductService,
  createProductService,
  updateProductService,
  deleteProductService,
  fetchProductsByCategoryService,
} from '#services';

export async function getProducts(_req, res) {
  try {
    const products = await fetchProductsService();
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export const getProductsByCategory = async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export async function getProductById(req, res) {
  try {
    const product = await fetchProductService(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function createProduct(req, res) {
  try {
    const product = await createProductService(req.body);
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create product' });
  }
}

export async function updateProduct(req, res) {
  try {
    const product = await updateProductService(req.params.id, req.body);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product' });
  }
}

export async function deleteProduct(req, res) {
  try {
    await deleteProductService(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
}
