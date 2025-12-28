import {
  getTotalUsers,
  getTotalProducts,
  getTotalOrders,
  getOrdersByStatus,
  getTotalRevenue,
  getTotalProductsSold,
  getLowStockProducts,
} from '#models';

export const getAdminStatsService = async () => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    ordersByStatus,
    totalRevenue,
    totalProductsSold,
    lowStockProducts,
  ] = await Promise.all([
    getTotalUsers(),
    getTotalProducts(),
    getTotalOrders(),
    getOrdersByStatus(),
    getTotalRevenue(),
    getTotalProductsSold(),
    getLowStockProducts(),
  ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    ordersByStatus,
    totalRevenue,
    totalProductsSold,
    lowStockProducts,
  };
};
