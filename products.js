/* =========================================================
   SHOPORA MARKET STORE
   CENTRAL PRODUCT DATABASE
   ========================================================= */

const products = {

  /* =======================================================
     TEST PRODUCT
     ======================================================= */

  "modern-smart-watch": {
    id: "modern-smart-watch",

    name: "Modern Smart Watch",

    category: "Electronics",

    price: 6999,

    image: "assets/products/modern-smart-watch.png",

    description:
      "A modern smart watch designed for everyday connected living, convenience and smart lifestyle use.",

    badge: "New",

    /* Product selling information */
    buyable: true,

    stock: 10,

    sku: "SMW-001",

    /* Seller information */
    seller: "Shopora Market Store",

    /* Product status */
    status: "active"
  },


  /* =======================================================
     EXISTING 12 PRODUCTS
     ======================================================= */

  "everyday-premium-essential": {
    id: "everyday-premium-essential",
    name: "Everyday Premium Essential",
    category: "Lifestyle",
    price: 2499,
    image: "assets/products/everyday-premium-essential.png",
    description:
      "A carefully selected everyday essential from Shopora Market Store, designed to bring practical style and modern comfort into your daily routine.",
    badge: "Essential",
    buyable: true,
    stock: 10,
    sku: "EPE-001",
    seller: "Shopora Market Store",
    status: "active"
  },


  "modern-everyday-collection": {
    id: "modern-everyday-collection",
    name: "Modern Everyday Collection",
    category: "Fashion",
    price: 3499,
    image: "assets/products/modern-everyday-collection.png",
    description:
      "A modern fashion essential selected for versatile everyday styling and a clean contemporary look.",
    badge: "New",
    buyable: true,
    stock: 10,
    sku: "MEC-001",
    seller: "Shopora Market Store",
    status: "active"
  },


  "smart-everyday-device": {
    id: "smart-everyday-device",
    name: "Smart Everyday Device",
    category: "Electronics",
    price: 4999,
    image: "assets/products/smart-everyday-device.png",
    description:
      "A practical everyday technology pick designed for modern routines, entertainment and connected living.",
    badge: "Smart Pick",
    buyable: true,
    stock: 10,
    sku: "SED-001",
    seller: "Shopora Market Store",
    status: "active"
  },


  "minimal-signature-accessory": {
    id: "minimal-signature-accessory",
    name: "Minimal Signature Accessory",
    category: "Accessories",
    price: 1899,
    image: "assets/products/minimal-signature-accessory.png",
    description:
      "A refined accessory with a minimal aesthetic, selected to complement everyday outfits and personal style.",
    badge: "Signature",
    buyable: true,
    stock: 10,
    sku: "MSA-001",
    seller: "Shopora Market Store",
    status: "active"
  },


  "daily-beauty-essential": {
    id: "daily-beauty-essential",
    name: "Daily Beauty Essential",
    category: "Beauty",
    price: 1599,
    image: "assets/products/daily-beauty-essential.png",
    description:
      "An everyday beauty selection designed for simple, practical and modern personal-care routines.",
    badge: "Beauty Pick",
    buyable: true,
    stock: 10,
    sku: "DBE-001",
    seller: "Shopora Market Store",
    status: "active"
  },


  "modern-home-essential": {
    id: "modern-home-essential",
    name: "Modern Home Essential",
    category: "Home & Living",
    price: 2299,
    image: "assets/products/modern-home-essential.png",
    description:
      "A modern home essential selected to add practical function and a refined touch to everyday spaces.",
    badge: "Home Pick",
    buyable: true,
    stock: 10,
    sku: "MHE-001",
    seller: "Shopora Market Store",
    status: "active"
  },


  "everyday-lifestyle-pick": {
    id: "everyday-lifestyle-pick",
    name: "Everyday Lifestyle Pick",
    category: "Lifestyle",
    price: 1999,
    image: "assets/products/everyday-lifestyle-pick.png",
    description:
      "A practical lifestyle product selected for everyday use, convenience and modern living.",
    badge: "Popular",
    buyable: true,
    stock: 10,
    sku: "ELP-001",
    seller: "Shopora Market Store",
    status: "active"
  },


  "classic-wardrobe-essential": {
    id: "classic-wardrobe-essential",
    name: "Classic Wardrobe Essential",
    category: "Fashion",
    price: 2899,
    image: "assets/products/classic-wardrobe-essential.png",
    description:
      "A classic wardrobe essential designed to fit effortlessly into a versatile everyday fashion collection.",
    badge: "Classic",
    buyable: true,
    stock: 10,
    sku: "CWE-001",
    seller: "Shopora Market Store",
    status: "active"
  },


  "signature-beauty-set": {
    id: "signature-beauty-set",
    name: "Signature Beauty Set",
    category: "Beauty",
    price: 1799,
    image: "assets/products/signature-beauty-set.png",
    description:
      "A curated beauty set selected for convenient everyday self-care and personal routines.",
    badge: "Signature",
    buyable: true,
    stock: 10,
    sku: "SBS-001",
    seller: "Shopora Market Store",
    status: "active"
  },


  "connected-smart-essential": {
    id: "connected-smart-essential",
    name: "Connected Smart Essential",
    category: "Electronics",
    price: 5999,
    image: "assets/products/connected-smart-essential.png",
    description:
      "A connected everyday technology essential designed for modern routines and smart lifestyle use.",
    badge: "Smart",
    buyable: true,
    stock: 10,
    sku: "CSE-001",
    seller: "Shopora Market Store",
    status: "active"
  },


  "everyday-carry-accessory": {
    id: "everyday-carry-accessory",
    name: "Everyday Carry Accessory",
    category: "Accessories",
    price: 1399,
    image: "assets/products/everyday-carry-accessory.png",
    description:
      "A practical everyday carry accessory selected for convenient organization and modern personal style.",
    badge: "Everyday",
    buyable: true,
    stock: 10,
    sku: "ECA-001",
    seller: "Shopora Market Store",
    status: "active"
  },


  "elevated-living-essential": {
    id: "elevated-living-essential",
    name: "Elevated Living Essential",
    category: "Home & Living",
    price: 2699,
    image: "assets/products/elevated-living-essential.png",
    description:
      "An elevated home essential selected to bring a clean and refined feel to everyday living spaces.",
    badge: "Featured",
    buyable: true,
    stock: 10,
    sku: "ELE-001",
    seller: "Shopora Market Store",
    status: "active"
  }

};


/* =========================================================
   PRODUCT FUNCTIONS
   ========================================================= */

function getProduct(productId) {
  return products[productId] || null;
}


function getAllProducts() {
  return Object.values(products);
}


function getProductsByCategory(category) {

  return Object.values(products).filter(product =>
    product.category.toLowerCase() ===
    category.toLowerCase()
  );

}


function searchProducts(query) {

  const searchTerm =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!searchTerm) {
    return getAllProducts();
  }

  return Object.values(products).filter(product =>
    product.name.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm)
  );

}


function getRelatedProducts(productId, limit = 4) {

  const currentProduct =
    getProduct(productId);

  if (!currentProduct) {
    return [];
  }

  const sameCategory =
    Object.values(products).filter(product =>
      product.id !== productId &&
      product.category === currentProduct.category
    );

  const otherProducts =
    Object.values(products).filter(product =>
      product.id !== productId &&
      product.category !== currentProduct.category
    );

  return [
    ...sameCategory,
    ...otherProducts
  ].slice(0, limit);

}


function formatPrice(price) {

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(price);

}


/* =========================================================
   SHOPORA GLOBAL PRODUCT OBJECT
   ========================================================= */

window.ShoporaProducts = {

  products,

  getProduct,

  getAllProducts,

  getProductsByCategory,

  searchProducts,

  getRelatedProducts,

  formatPrice

};
