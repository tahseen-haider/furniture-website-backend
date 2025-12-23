import { categories } from '#constants';
export const getCategories = (req, res) => {
  res.json(categories);
};
