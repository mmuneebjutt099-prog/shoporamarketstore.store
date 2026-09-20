/* =========================================================
   SHOPORA MARKET STORE
   products.js
   Shopify Storefront Product System
   ========================================================= */

const SHOPIFY_STORE_DOMAIN = "fsgigg-tp.myshopify.com";
const SHOPIFY_API_VERSION = "2026-07";

/*
  Shopify Storefront public token
  Is token ko frontend mein use kiya ja sakta hai.
*/
const SHOPIFY_STOREFRONT_PUBLIC_TOKEN =
  "b00f8861faa3611c651415d574bf0095";

const SHOPIFY_GRAPHQL_URL =
  `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;


/* =========================================================
   SHOPIFY REQUEST
   ========================================================= */

async function shopifyRequest(query, variables = {}) {
  try {
    const response = await fetch(SHOPIFY_GRAPHQL_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token":
          SHOPIFY_STOREFRONT_PUBLIC_TOKEN
      },

      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(
        `Shopify HTTP error: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.errors && result.errors.length) {
      console.error("Shopify GraphQL errors:", result.errors);
      throw new Error(result.errors[0].message);
    }

    return result.data;

  } catch (error) {
    console.error("Shopify request failed:", error);
    throw error;
  }
}


/* =========================================================
   GET ALL PRODUCTS
   ========================================================= */

async function getAllProducts(options = {}) {

  const first = options.first || 50;

  const query = `
    query GetProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            handle
            title
            description
            descriptionHtml

            availableForSale

            vendor
            productType

            featuredImage {
              url
              altText
              width
              height
            }

            images(first: 10) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }

            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  availableForSale

                  quantityAvailable

                  price {
                    amount
                    currencyCode
                  }

                  compareAtPrice {
                    amount
                    currencyCode
                  }

                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyRequest(query, { first });

  const products = data?.products?.edges || [];

  return products.map(edge => normalizeShopifyProduct(edge.node));
}


/* =========================================================
   GET SINGLE PRODUCT BY HANDLE
   ========================================================= */

async function getProductByHandle(handle) {

  if (!handle) {
    return null;
  }

  const query = `
    query GetProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml

        availableForSale

        vendor
        productType

        featuredImage {
          url
          altText
          width
          height
        }

        images(first: 20) {
          edges {
            node {
              url
              altText
              width
              height
            }
          }
        }

        variants(first: 100) {
          edges {
            node {
              id
              title
              availableForSale

              quantityAvailable

              price {
                amount
                currencyCode
              }

              compareAtPrice {
                amount
                currencyCode

              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyRequest(query, {
    handle
  });

  if (!data?.product) {
    return null;
  }

  return normalizeShopifyProduct(data.product);
}


/* =========================================================
   NORMALIZE PRODUCT
   ========================================================= */

function normalizeShopifyProduct(product) {

  const variants =
    product?.variants?.edges?.map(edge => edge.node) || [];

  /*
    Pehle available variant choose karo.
    Agar koi available variant nahi hai to first variant.
  */
  const selectedVariant =
    variants.find(variant => variant.availableForSale) ||
    variants[0] ||
    null;

  const images =
    product?.images?.edges?.map(edge => edge.node) || [];

  const featuredImage =
    product?.featuredImage ||
    images[0] ||
    null;

  const price =
    selectedVariant?.price?.amount || "0.00";

  const currency =
    selectedVariant?.price?.currencyCode || "PKR";

  const compareAtPrice =
    selectedVariant?.compareAtPrice?.amount || null;

  const available =
    Boolean(
      product?.availableForSale &&
      selectedVariant?.availableForSale
    );

  return {

    /* Shopify identity */
    id: product.id,
    shopifyId: product.id,
    handle: product.handle,

    /* Product information */
    title: product.title,
    name: product.title,

    description: product.description || "",
    descriptionHtml: product.descriptionHtml || "",

    vendor: product.vendor || "",
    productType: product.productType || "",

    /* Images */
    image: featuredImage?.url || "",
    imageUrl: featuredImage?.url || "",
    featuredImage: featuredImage,

    images: images,

    /* Pricing */
    price: Number(price),
    priceAmount: price,
    currency: currency,

    formattedPrice: formatProductPrice(
      price,
      currency
    ),

    compareAtPrice: compareAtPrice
      ? Number(compareAtPrice)
      : null,

    /* Variant */
    variantId: selectedVariant?.id || null,
    variant: selectedVariant,

    variants: variants,

    /* Availability */
    availableForSale: available,
    available: available,
    buyable: available,

    /*
      Frontend stock display.
      Shopify quantityAvailable may be null depending
      on store/API configuration.
    */
    stock:
      selectedVariant?.quantityAvailable != null
        ? selectedVariant.quantityAvailable
        : available
          ? 999
          : 0
  };
}


/* =========================================================
   FORMAT PRICE
   ========================================================= */

function formatProductPrice(
  amount,
  currency = "PKR"
) {

  const numericAmount = Number(amount || 0);

  try {

    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0
    }).format(numericAmount);

  } catch (error) {

    return `${currency} ${numericAmount.toLocaleString()}`;
  }
}


/* =========================================================
   GET PRODUCT BY ID
   ========================================================= */

async function getProductById(productId) {

  if (!productId) {
    return null;
  }

  const products = await getAllProducts({
    first: 50
  });

  return (
    products.find(
      product =>
        product.id === productId ||
        product.shopifyId === productId
    ) || null
  );
}


/* =========================================================
   GET AVAILABLE PRODUCTS
   ========================================================= */

async function getAvailableProducts(options = {}) {

  const products = await getAllProducts(options);

  return products.filter(
    product => product.buyable === true
  );
}


/* =========================================================
   FIND PRODUCT
   ========================================================= */

async function findProduct(identifier) {

  if (!identifier) {
    return null;
  }

  /*
    Agar Shopify handle hai to direct Shopify request.
  */
  if (
    typeof identifier === "string" &&
    !identifier.startsWith("gid://")
  ) {

    const product =
      await getProductByHandle(identifier);

    if (product) {
      return product;
    }
  }

  /*
    Otherwise product ID se search.
  */
  if (
    typeof identifier === "string" &&
    identifier.startsWith("gid://")
  ) {

    return await getProductById(identifier);
  }

  return null;
}


/* =========================================================
   SHOPIFY CART HELPERS
   ========================================================= */

const SHOPORA_CART_STORAGE_KEY =
  "shoporaShopifyCartId";


function getShopifyCartId() {

  return localStorage.getItem(
    SHOPORA_CART_STORAGE_KEY
  );
}


function saveShopifyCartId(cartId) {

  if (!cartId) {
    return;
  }

  localStorage.setItem(
    SHOPORA_CART_STORAGE_KEY,
    cartId
  );
}


function clearShopifyCartId() {

  localStorage.removeItem(
    SHOPORA_CART_STORAGE_KEY
  );
}


/* =========================================================
   CREATE SHOPIFY CART
   ========================================================= */

async function createShopifyCart(
  variantId,
  quantity = 1
) {

  if (!variantId) {
    throw new Error(
      "Product variant is missing."
    );
  }

  const mutation = `
    mutation CreateCart(
      $lines: [CartLineInput!]
    ) {
      cartCreate(
        input: {
          lines: $lines
        }
      ) {
        cart {
          id
          checkoutUrl

          totalQuantity

          cost {
            totalAmount {
              amount
              currencyCode
            }
          }

          lines(first: 100) {
            edges {
              node {
                id
                quantity

                merchandise {
                  ... on ProductVariant {
                    id

                    product {
                      id
                      title
                      handle
                    }

                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyRequest(
    mutation,
    {
      lines: [
        {
          merchandiseId: variantId,
          quantity: quantity
        }
      ]
    }
  );

  const payload =
    data?.cartCreate;

  if (payload?.userErrors?.length) {

    console.error(
      "Cart create errors:",
      payload.userErrors
    );

    throw new Error(
      payload.userErrors[0].message
    );
  }

  const cart =
    payload?.cart;

  if (!cart?.id) {
    throw new Error(
      "Shopify cart could not be created."
    );
  }

  saveShopifyCartId(cart.id);

  return cart;
}


/* =========================================================
   ADD TO EXISTING SHOPIFY CART
   ========================================================= */

async function addToShopifyCart(
  cartId,
  variantId,
  quantity = 1
) {

  const mutation = `
    mutation AddCartLines(
      $cartId: ID!,
      $lines: [CartLineInput!]!
    ) {
      cartLinesAdd(
        cartId: $cartId,
        lines: $lines
      ) {
        cart {
          id
          checkoutUrl
          totalQuantity

          cost {
            totalAmount {
              amount
              currencyCode
            }
          }

          lines(first: 100) {
            edges {
              node {
                id
                quantity

                merchandise {
                  ... on ProductVariant {
                    id

                    product {
                      id
                      title
                      handle
                    }

                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyRequest(
    mutation,
    {
      cartId,
      lines: [
        {
          merchandiseId: variantId,
          quantity: quantity
        }
      ]
    }
  );

  const payload =
    data?.cartLinesAdd;

  if (payload?.userErrors?.length) {

    console.error(
      "Cart add errors:",
      payload.userErrors
    );

    throw new Error(
      payload.userErrors[0].message
    );
  }

  const cart =
    payload?.cart;

  if (!cart?.id) {
    throw new Error(
      "Product could not be added to cart."
    );
  }

  saveShopifyCartId(cart.id);

  return cart;
}


/* =========================================================
   ADD PRODUCT TO CART
   ========================================================= */

async function addProductToCart(
  product,
  quantity = 1
) {

  if (!product) {
    throw new Error(
      "Product not found."
    );
  }

  const variantId =
    product.variantId ||
    product.variant?.id;

  if (!variantId) {
    throw new Error(
      "This product has no Shopify variant."
    );
  }

  let cartId =
    getShopifyCartId();

  /*
    Existing cart ho to usmein product add karo.
  */
  if (cartId) {

    try {

      return await addToShopifyCart(
        cartId,
        variantId,
        quantity
      );

    } catch (error) {

      /*
        Agar old/expired cart hai,
        naya cart create kar do.
      */

      console.warn(
        "Existing Shopify cart failed. Creating new cart.",
        error
      );

      clearShopifyCartId();
    }
  }

  /*
    No cart → new Shopify cart.
  */

  return await createShopifyCart(
    variantId,
    quantity
  );
}


/* =========================================================
   GET CURRENT SHOPIFY CART
   ========================================================= */

async function getShopifyCart() {

  const cartId =
    getShopifyCartId();

  if (!cartId) {
    return null;
  }

  const query = `
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl

        totalQuantity

        cost {
          totalAmount {
            amount
            currencyCode
          }
        }

        lines(first: 100) {
          edges {
            node {
              id
              quantity

              merchandise {
                ... on ProductVariant {
                  id
                  title

                  product {
                    id
                    title
                    handle

                    featuredImage {
                      url
                      altText
                    }
                  }

                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {

    const data =
      await shopifyRequest(
        query,
        {
          cartId
        }
      );

    const cart =
      data?.cart;

    if (!cart) {

      clearShopifyCartId();

      return null;
    }

    return cart;

  } catch (error) {

    console.error(
      "Could not load Shopify cart:",
      error
    );

    return null;
  }
}


/* =========================================================
   CART COUNT
   ========================================================= */

async function getShopifyCartCount() {

  const cart =
    await getShopifyCart();

  return cart?.totalQuantity || 0;
}


/* =========================================================
   UPDATE CART COUNT ON PAGE
   ========================================================= */

async function updateShopifyCartCount() {

  const count =
    await getShopifyCartCount();

  const selectors = [
    "#cartCount",
    ".cart-count",
    "[data-cart-count]",
    ".cart-badge"
  ];

  selectors.forEach(selector => {

    document
      .querySelectorAll(selector)
      .forEach(element => {

        element.textContent =
          count;

        element.style.display =
          count > 0
            ? ""
            : "";
      });
  });

  return count;
}


/* =========================================================
   OPEN SHOPIFY CHECKOUT
   ========================================================= */

async function goToShopifyCheckout() {

  const cart =
    await getShopifyCart();

  if (!cart?.checkoutUrl) {

    alert(
      "Your cart is empty. Please add a product first."
    );

    return;
  }

  window.location.href =
    cart.checkoutUrl;
}


/* =========================================================
   PRODUCT URL
   ========================================================= */

function getProductUrl(product) {

  if (!product) {
    return "#";
  }

  if (product.handle) {

    return (
      `product.html?handle=` +
      encodeURIComponent(product.handle)
    );
  }

  return "#";
}


/* =========================================================
   PRODUCT IMAGE
   ========================================================= */

function getProductImage(product) {

  if (!product) {
    return "";
  }

  return (
    product.image ||
    product.imageUrl ||
    product.featuredImage?.url ||
    product.images?.[0]?.url ||
    ""
  );
}


/* =========================================================
   SAFE HTML
   ========================================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   GLOBAL SHOPORA PRODUCT API
   ========================================================= */

window.ShoporaProducts = {

  getAllProducts,
  getProductByHandle,
  getProductById,
  getAvailableProducts,
  findProduct,

  addProductToCart,

  getShopifyCart,
  getShopifyCartCount,
  updateShopifyCartCount,

  goToShopifyCheckout,

  getProductUrl,
  getProductImage,
  formatProductPrice,
  escapeHtml
};


/* =========================================================
   AUTO CART COUNT
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateShopifyCartCount()
      .catch(error => {
        console.error(
          "Cart count initialization failed:",
          error
        );
      });

  }
);
