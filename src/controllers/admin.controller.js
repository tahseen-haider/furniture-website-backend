import { getAdminStatsService } from '#services';

export const getStatsAdmin = async (req, res) => {
  try {
    const stats = await getAdminStatsService();
    res.json({
      success: true,
      message: 'Admin stats fetched successfully',
      data: { stats },
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin stats',
    });
  }
};
