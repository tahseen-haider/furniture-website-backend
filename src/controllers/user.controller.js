import { getAllUsersService, getUserByIdService } from '#services';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsersService();
    res.json({
      success: true,
      message: 'Users fetched successfully',
      data: { users },
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await getUserByIdService(userId);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      message: 'User fetched successfully',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};
