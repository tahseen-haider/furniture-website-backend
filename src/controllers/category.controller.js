import {
  createCategory,
  fetchCategories,
  fetchCategory,
  updateCategory,
  deleteCategory,
} from '#services';

export const getCategories = async (_req, res) => {
  const categories = await fetchCategories();
  res.json(categories);
};

export const getCategory = async (req, res) => {
  const category = await fetchCategory(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(category);
};

export const createCategoryController = async (req, res) => {
  const category = await createCategory(req.body);
  res.status(201).json(category);
};

export const updateCategoryController = async (req, res) => {
  const category = await updateCategory(req.params.id, req.body);
  res.json(category);
};

export const deleteCategoryController = async (req, res) => {
  await deleteCategory(req.params.id);
  res.status(200).json({ message: 'Category status changed to inactive' });
};
