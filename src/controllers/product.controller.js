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

export async function getProducts(_req, res, next) {
  try {
    const products = await fetchProductsService();
    res.json({
      success: true,
      message: 'Products fetched successfully',
      data: { products },
    });
  } catch (err) {
    next(err);
  }
}

export const getProductsByCategory = async (req, res, next) => {
  try {
    const {
      price_min,
      price_max,
      sort: sortQuery,
      page,
      available = 'in',
    } = req.query;

    const sort = sortQuery?.length ? sortQuery : 'title-ascending';
    const args = {
      category: req.params.category,
      price_min: price_min ? Number(price_min) : undefined,
      price_max: price_max ? Number(price_max) : undefined,
      sort,
      page: Number(page) || 1,
      pageSize: productsPerPage || 12,
      available,
    };

    const data = await fetchProductsByCategoryService(args);
    res.json({ success: true, message: 'Products fetched successfully', data });
  } catch (err) {
    next(err);
  }
};

export async function getProductById(req, res, next) {
  try {
    const product = await fetchProductService(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });

    res.json({
      success: true,
      message: 'Product fetched successfully',
      data: { product },
    });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { errors } = validateCreateProductPayload(req.body);
    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const result = await createProductService(req.body);
    if (result.exists) {
      return res.status(409).json({
        success: false,
        message: 'Product with this slug already exists',
        data: { productId: result.id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: result.product },
    });
  } catch (err) {
    next(err);
  }
}

export const getProductsAdmin = async (_req, res, next) => {
  try {
    const products = await fetchProductsAdminService();
    res.json({
      success: true,
      message: 'Products fetched successfully',
      data: { products },
    });
  } catch (err) {
    next(err);
  }
};

export async function updateProduct(req, res, next) {
  try {
    const { errors } = validateCreateProductPayload(req.body);
    if (errors.length > 0)
      return res
        .status(400)
        .json({ success: false, message: 'Validation failed', errors });

    const product = await updateProductService(req.params.id, req.body);
    if (product === null)
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    if (product.errors)
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: product.errors,
      });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await deleteProductService(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
}
