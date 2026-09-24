export const PRODUCT_RULES = {
  category: "Fashion",

  allowedCategories: [
    "women clothing",
    "women's clothing",
    "womens clothing",
    "men clothing",
    "men's clothing",
    "mens clothing",
    "clothing",
    "apparel",
    "shoes",
    "footwear",
    "bags",
    "handbags",
    "watches",
    "jewelry",
    "fashion jewelry",
    "fashion accessories",
    "accessories"
  ],

  excludedCategories: [
    "electronics",
    "phones",
    "mobile phone",
    "computer",
    "laptop",
    "tablet",
    "gadgets",
    "makeup",
    "cosmetics",
    "supplements",
    "food",
    "toys",
    "adult"
  ],

  requireImage: true,
  requireVariants: true,
  requireStock: true,
  requireShipping: true,

  minImages: 1,
  minStock: 1,

  cleanTitle: true,

  publishToOnlineStore: true,
  publishToHeadless: true,

  createOrder: true,
  markPaid: false,
  markFulfilled: false
};

export function isFashionProduct(product) {
  if (!product) {
    return false;
  }

  const text = [
    product.title || "",
    product.category || "",
    product.productType || "",
    product.product_type || "",
    product.tags || ""
  ]
    .join(" ")
    .toLowerCase();

  const excluded = PRODUCT_RULES.excludedCategories.some(
    item => text.includes(item.toLowerCase())
  );

  if (excluded) {
    return false;
  }

  const allowed = PRODUCT_RULES.allowedCategories.some(
    item => text.includes(item.toLowerCase())
  );

  return allowed;
}
