export const PRODUCT_RULES = {
  category: "Fashion",

  allowedCategories: [
    "women clothing",
    "men clothing",
    "shoes",
    "bags",
    "watches",
    "jewelry",
    "fashion accessories"
  ],

  excludedCategories: [
    "electronics",
    "phones",
    "computer",
    "gadgets",
    "makeup",
    "cosmetics",
    "supplements",
    "food",
    "toys"
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
    product.productType || ""
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
