import { getAllUsersService, getUserByIdService } from '#services';

export const getAllUsers = async (req, res) => {
  const users = await getAllUsersService();
  res.status(200).json({
    message: 'Users returned',
    data: {
      users,
    },
  });
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  const user = await getUserByIdService(userId);
  res.status(200).json({
    message: 'User returned',
    data: {
      user,
    },
  });
};
