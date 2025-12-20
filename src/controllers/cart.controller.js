import { getCartByUserId, upsertCart, clearCartByUserId } from '#models';

export const getCart = async (req, res, next) => {
  try {
    const cart = await getCartByUserId(req.user.id);
    res.json({ cart: cart || {} });
  } catch (err) {
    next(err);
  }
};

export const updateCart = async (req, res, next) => {
  try {
    const { cart } = req.body;

    if (!cart || typeof cart !== 'object') {
      return res.status(400).json({ message: 'Invalid cart payload' });
    }

    const savedCart = await upsertCart(req.user.id, cart);
    res.json({ cart: savedCart });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await clearCartByUserId(req.user.id);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};
