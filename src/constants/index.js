import fs from 'fs';
import path from 'path';

const categories = JSON.parse(
  fs.readFileSync(path.resolve('./src/constants/categories.json'), 'utf8')
);
const productsJSON = JSON.parse(
  fs.readFileSync(path.resolve('./src/constants/products.json'), 'utf8')
);

const products = productsJSON.products;
export { categories, products };
