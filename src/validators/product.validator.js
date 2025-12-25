export const validateCreateProductPayload = (body) => {
  const errors = [];
  const warnings = [];

  if (!body.product) {
    errors.push('product object is required');
    return { errors, warnings };
  }

  const {
    title,
    slug,
    description,
    generalCategory,
    vendor,
    freeShipping,
    itemsInStock,
  } = body.product;

  if (!title) errors.push('product.title is required');
  if (!slug) errors.push('product.slug is required');
  if (!description) errors.push('product.description is required');
  if (!generalCategory) errors.push('product.generalCategory is required');
  if (!vendor) errors.push('product.vendor is required');
  if (typeof freeShipping !== 'boolean')
    errors.push('product.freeShipping is required and must be boolean');
  if (typeof itemsInStock !== 'number' || itemsInStock < 0)
    errors.push('product.itemsInStock is required and must be >= 0');

  if (!Array.isArray(body.variants)) {
    errors.push('variants must be an array');
  } else if (body.variants.length === 0) {
    errors.push('at least one variant is required');
  } else {
    body.variants.forEach((v, i) => {
      if (!v.variantId) errors.push(`variants[${i}].variantId is required`);
      if (!v.title) errors.push(`variants[${i}].title is required`);
      if (typeof v.price !== 'number' || v.price <= 0) {
        errors.push(`variants[${i}].price must be a number > 0`);
      }
    });
  }

  if (!Array.isArray(body.categories) || body.categories.length === 0) {
    errors.push('categories must be a non-empty array of slugs');
  }

  if (!Array.isArray(body.images) || body.images.length === 0) {
    errors.push('images must be a non-empty array');
  }

  if (!Array.isArray(body.features) || body.features.length === 0) {
    errors.push('features must be a non-empty array');
  }

  if (body.buyTogether) {
    if (!Array.isArray(body.buyTogether)) {
      errors.push('buyTogether must be an array');
    } else {
      const unique = new Set(body.buyTogether);
      if (unique.size !== body.buyTogether.length) {
        errors.push('buyTogether cannot contain duplicates');
      }
      if (body.buyTogether.length > 2) {
        errors.push('buyTogether can contain max 2 products');
      }
    }
  }

  return { errors, warnings };
};
