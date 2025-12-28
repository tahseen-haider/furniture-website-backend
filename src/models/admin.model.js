import { pool } from '#config';

export const getTotalUsers = async () => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM users WHERE is_verified = true`
  );
  return rows[0].total;
};

export const getTotalProducts = async () => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM products`
  );
  return rows[0].total;
};

export const getTotalOrders = async () => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM orders`
  );
  return rows[0].total;
};

export const getOrdersByStatus = async () => {
  const { rows } = await pool.query(
    `SELECT status, COUNT(*)::int AS count
     FROM orders
     GROUP BY status`
  );
  return rows;
};

export const getTotalRevenue = async () => {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(price * quantity),0)::numeric AS total_revenue
     FROM order_items`
  );
  return Number(rows[0].total_revenue);
};

export const getTotalProductsSold = async () => {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(quantity),0)::int AS sold
     FROM order_items`
  );
  return rows[0].sold;
};

export const getLowStockProducts = async (threshold = 5) => {
  const { rows } = await pool.query(
    `SELECT id, title, items_in_stock
     FROM products
     WHERE items_in_stock <= $1
     ORDER BY items_in_stock ASC`,
    [threshold]
  );
  return rows;
};
