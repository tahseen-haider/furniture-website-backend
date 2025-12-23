import { createOrder, getOrderByTrackingId } from '#services';

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const orderData = req.body;

    const order = await createOrder(userId, orderData);

    return res.status(201).json({
      message: 'Order placed! Check your email for Tracking ID.',
      order,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create order' });
  }
};

export const getOrder = async (req, res) => {
  const { trackingId } = req.params;

  try {
    const order = await getOrderByTrackingId(trackingId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch order' });
  }
};
