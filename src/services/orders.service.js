import {
  pool,
  insertAddress,
  insertOrder,
  insertOrderItem,
  insertOrderTimeline,
} from '#models';
import { sendOrderTrackingEmail } from '#utils';
import crypto from 'crypto';

export const createOrder = async (userId, data) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const shippingAddressId = await insertAddress(client, data.shippingAddress);

    const billingAddressId = data.billingSameAsShipping
      ? shippingAddressId
      : await insertAddress(client, data.billingAddress);

    const trackingId = parseInt(crypto.randomBytes(6).toString('hex'), 16);

    const orderId = await insertOrder(client, {
      userId,
      trackingId,
      region: data.region,
      shippingAddressId,
      billingAddressId,
      billingSameAsShipping: data.billingSameAsShipping,
      status: 'Pending',
    });

    const items = Object.values(data.products);

    for (const item of items) {
      await insertOrderItem(client, {
        orderId,
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        variantTitle: item.variantTitle,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        freeShipping: item.freeShipping ?? false,
      });
    }

    await insertOrderTimeline(client, {
      orderId,
      status: 'Order Placed',
    });

    await client.query('COMMIT');

    await sendOrderTrackingEmail({
      email: data.shippingAddress.email,
      trackingId,
    });

    return { orderId, trackingId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getOrderByTrackingId = async (trackingId) => {
  const client = await pool.connect();

  try {
    const { rows } = await client.query(
      `
      SELECT
      o.tracking_id AS "trackingId",
      o.status,
      o.estimated_delivery AS "estimatedDelivery",
      o.billing_same_as_shipping AS "billingSameAsShipping",
      -- shipping address
      json_build_object(
        'firstName', sa.first_name,
        'lastName', sa.last_name,
        'address', sa.address_line,
        'city', sa.city,
        'postalCode', sa.postal_code,
        'phone', sa.phone,
        'email', sa.email
      ) AS "shippingAddress",
      -- billing address
      json_build_object(
        'firstName', ba.first_name,
        'lastName', ba.last_name,
        'address', ba.address_line,
        'city', ba.city,
        'postalCode', ba.postal_code,
        'phone', ba.phone,
        'email', ba.email
      ) AS "billingAddress",
      -- products array
      (
        SELECT COALESCE(json_agg(
          json_build_object(
            'productId', oi.product_id,
            'variantId', oi.variant_id,
            'title', oi.title,
            'variantTitle', oi.variant_title,
            'quantity', oi.quantity,
            'price', oi.price,
            'image', oi.image,
            'freeShipping', oi.free_shipping
          )
        ), '[]'::json)
        FROM order_items oi
        WHERE oi.order_id = o.id
      ) AS products,
      -- timeline array
      (
        SELECT COALESCE(json_agg(
          json_build_object(
            'date', ot.created_at::date,
            'status', ot.status
          ) ORDER BY ot.created_at
        ), '[]'::json)
        FROM order_timeline ot
        WHERE ot.order_id = o.id
      ) AS timeline
    FROM orders o
    LEFT JOIN addresses sa ON sa.id = o.shipping_address_id
    LEFT JOIN addresses ba ON ba.id = o.billing_address_id
    WHERE o.tracking_id::text = $1;
      `,
      [trackingId]
    );

    if (!rows[0]) return null;

    const res = rows[0];
    res.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    return rows[0];
  } finally {
    client.release();
  }
};
