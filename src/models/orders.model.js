export { pool } from '#config';

export const insertAddress = async (client, address) => {
  const {
    firstName,
    lastName,
    address: addr,
    city,
    postalCode,
    phone,
    email,
  } = address;

  const { rows } = await client.query(
    `INSERT INTO addresses (first_name, last_name, address_line, city, postal_code, phone, email)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id`,
    [firstName, lastName, addr, city, postalCode, phone, email]
  );

  return rows[0].id;
};

export const insertOrder = async (
  client,
  {
    userId,
    trackingId,
    region,
    shippingAddressId,
    billingAddressId,
    billingSameAsShipping,
    status,
  }
) => {
  const { rows } = await client.query(
    `
    INSERT INTO orders (
      user_id,
      tracking_id,
      region,
      shipping_address_id,
      billing_address_id,
      billing_same_as_shipping,
      status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id
    `,
    [
      userId,
      trackingId,
      region,
      shippingAddressId,
      billingAddressId,
      billingSameAsShipping,
      status,
    ]
  );

  return rows[0].id;
};

export const insertOrderItem = async (
  client,
  {
    orderId,
    productId,
    variantId,
    title,
    variantTitle,
    image,
    price,
    quantity,
    freeShipping,
  }
) => {
  const { rows } = await client.query(
    `
    INSERT INTO order_items (
      order_id,
      product_id,
      variant_id,
      title,
      variant_title,
      image,
      price,
      quantity,
      free_shipping
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id
    `,
    [
      orderId,
      productId,
      variantId,
      title,
      variantTitle,
      image,
      price,
      quantity,
      freeShipping,
    ]
  );

  return rows[0].id;
};

export const insertOrderTimeline = async (client, { orderId, status }) => {
  await client.query(
    `
    INSERT INTO order_timeline (order_id, status)
    VALUES ($1,$2)
    `,
    [orderId, status]
  );
};
