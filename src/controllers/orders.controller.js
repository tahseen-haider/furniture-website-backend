import { createOrder, getOrderByTrackingId, getOrdersService } from '#services';

export const getOrders = async (req, res, next) => {
  try {
    const orders = await getOrdersService({ page: 1, limit: 20 });
    res.json({
      success: true,
      message: 'Orders fetched successfully',
      data: { orders },
    });
  } catch (err) {
    next(err);
  }
};

export const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const orderData = req.body;
    const order = await createOrder(userId, orderData);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Check your email for Tracking ID.',
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    const order = await getOrderByTrackingId(trackingId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      message: 'Order fetched successfully',
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};
