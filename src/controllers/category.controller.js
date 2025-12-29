import {
  createCategory,
  fetchCategories,
  fetchCategory,
  updateCategory,
  deleteCategory,
} from '#services';

export const getCategories = async (_req, res, next) => {
  try {
    const categories = await fetchCategories();
    res.json({
      success: true,
      message: 'Categories fetched successfully',
      data: { categories },
    });
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const category = await fetchCategory(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    res.json({
      success: true,
      message: 'Category fetched successfully',
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

export const createCategoryController = async (req, res, next) => {
  try {
    const result = await createCategory(req.body);
    if (result.exists) {
      return res.status(409).json({
        success: false,
        message: 'Category with this slug already exists',
        data: { categoryId: result.id },
      });
    }
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category: result.category },
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategoryController = async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCategoryController = async (req, res, next) => {
  try {
    await deleteCategory(req.params.id);
    res.json({
      success: true,
      message: 'Category status changed to inactive',
    });
  } catch (err) {
    next(err);
  }
};
