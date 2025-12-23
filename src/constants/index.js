import fs from 'fs';
import path from 'path';

const categories = JSON.parse(
  fs.readFileSync(path.resolve('./src/constants/categories.json'), 'utf8')
);
const products = JSON.parse(
  fs.readFileSync(path.resolve('./src/constants/products.json'), 'utf8')
);

export { categories, products };
