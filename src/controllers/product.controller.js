import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { products } from '#constants';

export const getProductsByCategory = (req, res) => {
  res.json(products);
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getProductsById = (req, res) => {
  const { productId } = req.params;

  const filePath = path.resolve(
    __dirname,
    '../constants/product',
    `${productId}.json`
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Product not found' });
  }

  try {
    const product = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return res.status(200).json(product);
  } catch {
    return res.status(500).json({ message: 'Invalid product data' });
  }
};
