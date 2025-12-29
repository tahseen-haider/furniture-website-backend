import { getCartByUserId, upsertCart, clearCartByUserId } from '#models';

export const getCart = async (req, res, next) => {
  try {
    const cart = await getCartByUserId(req.user.id);
    res.json({
      success: true,
      message: 'Cart fetched successfully',
      data: { cart: cart || {} },
    });
  } catch (err) {
    next(err);
  }
};

export const updateCart = async (req, res, next) => {
  try {
    const { cart } = req.body;
    if (!cart || typeof cart !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart payload',
      });
    }

    const savedCart = await upsertCart(req.user.id, cart);
    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: { cart: savedCart },
    });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await clearCartByUserId(req.user.id);
    res.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (err) {
    next(err);
  }
};
