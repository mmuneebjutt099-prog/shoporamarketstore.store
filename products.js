/* =========================================================
   SHOPORA MARKET STORE
   products.js
   CENTRAL SHOPIFY PRODUCT + CART SYSTEM
   ========================================================= */

const SHOPIFY_STORE_DOMAIN = "fsgigg-tp.myshopify.com";
const SHOPIFY_API_VERSION = "2026-07";

const SHOPIFY_STOREFRONT_PUBLIC_TOKEN =
  "b00f8861faa3611c651415d574bf0095";

const SHOPIFY_GRAPHQL_URL =
  `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

const SHOPORA_CART_STORAGE_KEY =
  "shoporaShopifyCartId";


/* =========================================================
   SHOPIFY GRAPHQL REQUEST
   ========================================================= */

async function shopifyRequest(query, variables = {}) {

  const response = await fetch(
    SHOPIFY_GRAPHQL_URL,
    {
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
    }
  );

  if (!response.ok) {

    throw new Error(
      `Shopify HTTP error: ${response.status}`
    );

  }

  const result =
    await response.json();

  if (result.errors?.length) {

    console.error(
      "Shopify GraphQL errors:",
      result.errors
    );

    throw new Error(
      result.errors[0]?.message ||
      "Shopify request failed."
    );

  }

  return result.data;
}


/* =========================================================
   GET ALL PRODUCTS
   ========================================================= */

async function getAllProducts(options = {}) {

  const first =
    Math.min(
      Number(options.first) || 50,
      250
    );

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
            tags
 
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

                  price {
                    amount
                    currencyCode
                  }

                  compareAtPrice {
                    amount
                    currencyCode
                  }

                  image {
                    url
                    altText
                    width
                    height
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

  const data =
    await shopifyRequest(
      query,
      { first }
    );

  const edges =
    data?.products?.edges || [];

  return edges.map(
    edge =>
      normalizeShopifyProduct(
        edge.node
      )
  );
}


/* =========================================================
   GET PRODUCT BY HANDLE
   ========================================================= */

async function getProductByHandle(handle) {

  if (!handle) {
    return null;
  }

  const query = `
    query GetProductByHandle(
      $handle: String!
    ) {

      product(handle: $handle) {

        id
        handle
        title

        description
        descriptionHtml

        availableForSale

        vendor
        productType
        tags

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

              price {
                amount
                currencyCode
              }

              compareAtPrice {
                amount
                currencyCode
              }

              image {
                url
                altText
                width
                height
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
  `;

  const data =
    await shopifyRequest(
      query,
      { handle }
    );

  if (!data?.product) {
    return null;
  }

  return normalizeShopifyProduct(
    data.product
  );
}


/* =========================================================
   NORMALIZE PRODUCT
   ========================================================= */


/* =========================================================
   PRODUCT SHIPPING COUNTRIES
   ========================================================= */

/* =========================================================
   PRODUCT SHIPPING COUNTRIES
   ========================================================= */

const SHOPORA_COUNTRY_ALIASES = {
  US: "USA",
  USA: "USA",
  "UNITED STATES": "USA",
  "UNITED STATES OF AMERICA": "USA",

  PK: "Pakistan",
  PAKISTAN: "Pakistan",

  GB: "UK",
  UK: "UK",
  "UNITED KINGDOM": "UK",

  AE: "UAE",
  UAE: "UAE",
  "UNITED ARAB EMIRATES": "UAE",

  CA: "Canada",
  CANADA: "Canada",

  AU: "Australia",
  AUSTRALIA: "Australia",

  SA: "Saudi Arabia",
  "SAUDI ARABIA": "Saudi Arabia",

  DE: "Germany",
  GERMANY: "Germany",

  FR: "France",
  FRANCE: "France",

  IT: "Italy",
  ITALY: "Italy",

  ES: "Spain",
  SPAIN: "Spain"
};


function normalizeShippingCountry(value) {

  if (!value) {
    return "";
  }

  const text =
    String(value)
      .trim()
      .toUpperCase();

  return (
    SHOPORA_COUNTRY_ALIASES[text] ||
    String(value).trim()
  );
}


function extractShippingCountries(value) {

  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {

    return value
      .flatMap(item =>
        extractShippingCountries(item)
      )
      .filter(Boolean);

  }

  if (typeof value === "object") {

    const possibleFields = [
      value.country,
      value.country_name,
      value.countryName,
      value.ship_to_country,
      value.shipToCountry,
      value.destination_country,
      value.destinationCountry,
      value.code,
      value.country_code,
      value.countryCode,
      value.name
    ];

    return possibleFields
      .flatMap(item =>
        extractShippingCountries(item)
      )
      .filter(Boolean);
  }

  const text =
    String(value).trim();

  if (!text) {
    return [];
  }

  return text
    .split(/[,|;/]+/)
    .map(item =>
      normalizeShippingCountry(item)
    )
    .filter(Boolean);
}


function getProductShippingCountries(product) {

  /*
    IMPORTANT:
    Do NOT default every product to Pakistan.

    We first try to read real shipping-country
    information saved on the product.
  */

  const possibleSources = [

    product?.shippingCountries,

    product?.shipping_countries,

    product?.shipToCountries,

    product?.ship_to_countries,

    product?.shippingCountry,

    product?.shipping_country,

    product?.shipping,

    product?.shippingMethods,

    product?.shipping_methods,

    product?.shippingData,

    product?.shipping_data

  ];

  const countries = [];

    for (
    const source of possibleSources
  ) {

    countries.push(
      ...extractShippingCountries(
        source
      )
    );

  }


  /* Shopify product shipping tags */

  const tags =
    Array.isArray(product?.tags)
      ? product.tags
      : [];

  for (const tag of tags) {

    const text =
      String(tag || "").trim();

    if (
      text.toLowerCase().startsWith("ship:")
    ) {

      countries.push(
        text.slice(5)
      );

    }

  }


  return Array.from(
    new Set(
      countries
        .map(country =>
          normalizeShippingCountry(country)
        )
        .filter(Boolean)
    )
  );


/* =========================================================
   SHIPPING COUNTRY CHECK
   ========================================================= */

function productShipsToCountry(
  product,
  country = "USA"
) {

  const selectedCountry =
    normalizeShippingCountry(
      country
    );

  const countries =
    getProductShippingCountries(
      product
    );

  if (!selectedCountry) {
    return false;
  }

  return countries.some(
    shippingCountry =>
      normalizeShippingCountry(
        shippingCountry
      ) === selectedCountry
  );
}


/* =========================================================
   FILTER PRODUCTS BY SHIPPING COUNTRY
   ========================================================= */

function filterProductsByShippingCountry(
  products,
  country = "USA"
) {

  if (!Array.isArray(products)) {
    return [];
  }

  return products.filter(
    product =>
      productShipsToCountry(
        product,
        country
      )
  );
}

function normalizeShopifyProduct(product) {

  const variants =
    (product?.variants?.edges || [])
      .map(
        edge => edge.node
      )
      .filter(Boolean);

  const images =
    (product?.images?.edges || [])
      .map(
        edge => edge.node
      )
      .filter(Boolean);

  const featuredImage =
    product?.featuredImage ||
    images[0] ||
    null;

  const defaultVariant =
    variants.find(
      variant =>
        variant.availableForSale
    ) ||
    variants[0] ||
    null;

  const productAvailable =
    Boolean(
      product?.availableForSale
    );

  return {

    /* Product identity */

    id:
      product?.id || "",

    shopifyId:
      product?.id || "",

    handle:
      product?.handle || "",


    /* Product information */

    title:
      product?.title || "",

    name:
      product?.title || "",

    description:
      product?.description || "",

    descriptionHtml:
      product?.descriptionHtml || "",

        vendor:
      product?.vendor || "",

    productType:
      product?.productType || "",

    tags:
      Array.isArray(product?.tags)
        ? product.tags
        : [],

    shippingCountries:
      getProductShippingCountries(product),


    /* Images */

    image:
      featuredImage?.url || "",

    imageUrl:
      featuredImage?.url || "",

    featuredImage,

    images,


    /* Variants */

    variants,


    /* Default variant */

    variant:
      defaultVariant,

    variantId:
      defaultVariant?.id || null,

    price:
      Number(
        defaultVariant?.price?.amount || 0
      ),

    priceAmount:
      defaultVariant?.price?.amount || "0",

    currency:
      defaultVariant?.price?.currencyCode ||
      "PKR",

    formattedPrice:
      formatProductPrice(
        defaultVariant?.price?.amount || 0,
        defaultVariant?.price?.currencyCode ||
        "PKR"
      ),

    compareAtPrice:
      defaultVariant?.compareAtPrice?.amount
        ? Number(
            defaultVariant.compareAtPrice.amount
          )
        : null,


    /* Availability */

    availableForSale:
      productAvailable &&
      Boolean(
        defaultVariant?.availableForSale
      ),

    available:
      productAvailable &&
      Boolean(
        defaultVariant?.availableForSale
      ),

    buyable:
      productAvailable &&
      Boolean(
        defaultVariant?.availableForSale
      ),


    /*
      Storefront public token does not expose
      private inventory quantity here.
    */

    stock:
      productAvailable &&
      Boolean(
        defaultVariant?.availableForSale
      )
        ? 999
        : 0

  };

}


/* =========================================================
   GET VARIANT BY ID
   ========================================================= */

function getVariantById(
  product,
  variantId
) {

  if (
    !product ||
    !variantId
  ) {
    return null;
  }

  return (
    product.variants?.find(
      variant =>
        variant.id === variantId
    ) ||
    null
  );

}


/* =========================================================
   GET DEFAULT VARIANT
   ========================================================= */

function getDefaultVariant(product) {

  if (!product) {
    return null;
  }

  return (
    product.variants?.find(
      variant =>
        variant.availableForSale
    ) ||
    product.variants?.[0] ||
    null
  );

}


/* =========================================================
   GET AVAILABLE VARIANTS
   ========================================================= */

function getAvailableVariants(product) {

  if (!product) {
    return [];
  }

  return (
    product.variants || []
  ).filter(
    variant =>
      variant.availableForSale
  );

}


/* =========================================================
   APPLY VARIANT TO PRODUCT
   ========================================================= */

function applyVariantToProduct(
  product,
  variantId
) {

  if (!product) {
    return null;
  }

  const variant =
    getVariantById(
      product,
      variantId
    );

  if (!variant) {
    return null;
  }

  const image =
    variant.image?.url ||
    product.image ||
    "";

  const amount =
    variant.price?.amount ||
    "0";

  const currency =
    variant.price?.currencyCode ||
    "PKR";

  return {

    ...product,

    variant,

    variantId:
      variant.id,

    image,

    imageUrl:
      image,

    price:
      Number(amount),

    priceAmount:
      amount,

    currency,

    formattedPrice:
      formatProductPrice(
        amount,
        currency
      ),

    compareAtPrice:
      variant.compareAtPrice?.amount
        ? Number(
            variant.compareAtPrice.amount
          )
        : null,

    availableForSale:
      Boolean(
        product.availableForSale &&
        variant.availableForSale
      ),

    available:
      Boolean(
        product.availableForSale &&
        variant.availableForSale
      ),

    buyable:
      Boolean(
        product.availableForSale &&
        variant.availableForSale
      ),

    stock:
      product.availableForSale &&
      variant.availableForSale
        ? 999
        : 0

  };

}


/* =========================================================
   FORMAT PRODUCT PRICE
   ========================================================= */

function formatProductPrice(
  amount,
  currency = "PKR"
) {

  const numericAmount =
    Number(amount || 0);

  try {

    return new Intl.NumberFormat(
      "en-PK",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0
      }
    ).format(numericAmount);

  } catch {

    return (
      `${currency} ` +
      numericAmount.toLocaleString()
    );

  }

}


/* =========================================================
   GET PRODUCT BY ID
   ========================================================= */

async function getProductById(productId) {

  if (!productId) {
    return null;
  }

  const products =
    await getAllProducts({
      first: 250
    });

  return (
    products.find(
      product =>
        product.id === productId ||
        product.shopifyId === productId
    ) ||
    null
  );

}


/* =========================================================
   FIND PRODUCT
   ========================================================= */

async function findProduct(
  identifier
) {

  if (!identifier) {
    return null;
  }

  if (
    typeof identifier === "string" &&
    identifier.startsWith("gid://")
  ) {

    return getProductById(
      identifier
    );

  }

  return getProductByHandle(
    identifier
  );

}


/* =========================================================
   AVAILABLE PRODUCTS
   ========================================================= */

async function getAvailableProducts(
  options = {}
) {

  const products =
    await getAllProducts(
      options
    );

  return products.filter(
    product =>
      product.buyable
  );

}


/* =========================================================
   CART ID
   ========================================================= */

function getShopifyCartId() {

  return localStorage.getItem(
    SHOPORA_CART_STORAGE_KEY
  );

}


function saveShopifyCartId(
  cartId
) {

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
      "Shopify variant ID is missing."
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

        userErrors {
          field
          message
        }

      }

    }
  `;

  const data =
    await shopifyRequest(
      mutation,
      {
        lines: [
          {
            merchandiseId:
              variantId,

            quantity:
              Number(quantity)
          }
        ]
      }
    );

  const payload =
    data?.cartCreate;

  if (
    payload?.userErrors?.length
  ) {

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

  saveShopifyCartId(
    cart.id
  );

  return cart;

}


/* =========================================================
   ADD TO EXISTING CART
   ========================================================= */

async function addToShopifyCart(
  cartId,
  variantId,
  quantity = 1
) {

  if (!cartId) {

    throw new Error(
      "Shopify cart ID is missing."
    );

  }

  if (!variantId) {

    throw new Error(
      "Shopify variant ID is missing."
    );

  }

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

        userErrors {
          field
          message
        }

      }

    }
  `;

  const data =
    await shopifyRequest(
      mutation,
      {
        cartId,

        lines: [
          {
            merchandiseId:
              variantId,

            quantity:
              Number(quantity)
          }
        ]
      }
    );

  const payload =
    data?.cartLinesAdd;

  if (
    payload?.userErrors?.length
  ) {

    throw new Error(
      payload.userErrors[0].message
    );

  }

  const cart =
    payload?.cart;

  if (!cart?.id) {

    throw new Error(
      "Product could not be added to Shopify cart."
    );

  }

  saveShopifyCartId(
    cart.id
  );

  return cart;

}


/* =========================================================
   ADD PRODUCT TO CART
   =========================================================
   Supports:

   addProductToCart(product)
   addProductToCart(product, quantity)
   addProductToCart(product, quantity, variantId)

   Also supports:

   addProductToCart(productId, quantity)
   ========================================================= */

async function addProductToCart(
  product,
  quantity = 1,
  variantId = null
) {

  /*
   * Compatibility:
   * If a page passes Shopify product ID instead
   * of the full product object, load the product.
   */

  if (
    typeof product === "string"
  ) {

    const productId =
      product;

    product =
      await getProductById(
        productId
      );

  }


  if (!product) {

    throw new Error(
      "Product not found."
    );

  }


  let selectedProduct =
    product;


  /*
   * If a specific variant was selected,
   * apply that variant.
   */

  if (variantId) {

    selectedProduct =
      applyVariantToProduct(
        product,
        variantId
      );

    if (!selectedProduct) {

      throw new Error(
        "Selected variant not found."
      );

    }

  }


  const finalVariantId =
    selectedProduct.variantId ||
    selectedProduct.variant?.id;


  if (!finalVariantId) {

    throw new Error(
      "This product has no Shopify variant."
    );

  }


  if (
    selectedProduct.availableForSale === false
  ) {

    throw new Error(
      "This product variant is currently unavailable."
    );

  }


  const finalQuantity =
    Math.max(
      1,
      Number(quantity) || 1
    );


  let cartId =
    getShopifyCartId();


  /*
   * Try existing Shopify cart first.
   */

  if (cartId) {

    try {

      return await addToShopifyCart(
        cartId,
        finalVariantId,
        finalQuantity
      );

    } catch (error) {

      console.warn(
        "Existing Shopify cart failed. Creating a new cart.",
        error
      );

      clearShopifyCartId();

    }

  }


  /*
   * No valid existing cart:
   * create a fresh Shopify cart.
   */

  return await createShopifyCart(
    finalVariantId,
    finalQuantity
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
    query GetCart(
      $cartId: ID!
    ) {

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
        { cartId }
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
      "Shopify cart loading failed:",
      error
    );

    return null;

  }

}


/* =========================================================
   UPDATE CART LINE
   ========================================================= */

async function updateCartLine(
  lineId,
  quantity
) {

  if (!lineId) {

    throw new Error(
      "Cart line ID is missing."
    );

  }

  const finalQuantity =
    Number(quantity);


  /*
   * Shopify requires quantity > 0
   * for cartLinesUpdate.
   */

  if (
    !Number.isFinite(finalQuantity) ||
    finalQuantity < 1
  ) {

    return removeCartLine(
      lineId
    );

  }


  const mutation = `
    mutation UpdateCartLines(
      $cartId: ID!,
      $lines: [CartLineUpdateInput!]!
    ) {

      cartLinesUpdate(
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

        userErrors {
          field
          message
        }

      }

    }
  `;


  const cartId =
    getShopifyCartId();


  if (!cartId) {

    throw new Error(
      "Shopify cart not found."
    );

  }


  const data =
    await shopifyRequest(
      mutation,
      {
        cartId,

        lines: [
          {
            id: lineId,
            quantity: finalQuantity
          }
        ]

      }
    );


  const payload =
    data?.cartLinesUpdate;


  if (
    payload?.userErrors?.length
  ) {

    throw new Error(
      payload.userErrors[0].message
    );

  }


  const cart =
    payload?.cart;


  if (!cart?.id) {

    throw new Error(
      "Cart could not be updated."
    );

  }


  saveShopifyCartId(
    cart.id
  );


  return cart;

}


/* =========================================================
   REMOVE CART LINE
   ========================================================= */

async function removeCartLine(
  lineId
) {

  if (!lineId) {

    throw new Error(
      "Cart line ID is missing."
    );

  }


  const cartId =
    getShopifyCartId();


  if (!cartId) {

    throw new Error(
      "Shopify cart not found."
    );

  }


  const mutation = `
    mutation RemoveCartLines(
      $cartId: ID!,
      $lineIds: [ID!]!
    ) {

      cartLinesRemove(
        cartId: $cartId,
        lineIds: $lineIds
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

        userErrors {
          field
          message
        }

      }

    }
  `;


  const data =
    await shopifyRequest(
      mutation,
      {
        cartId,

        lineIds: [
          lineId
        ]

      }
    );


  const payload =
    data?.cartLinesRemove;


  if (
    payload?.userErrors?.length
  ) {

    throw new Error(
      payload.userErrors[0].message
    );

  }


  const cart =
    payload?.cart;


  if (!cart?.id) {

    throw new Error(
      "Cart item could not be removed."
    );

  }


  /*
   * If cart is empty, keep the cart ID
   * valid until Shopify returns it as empty.
   */

  saveShopifyCartId(
    cart.id
  );


  return cart;

}


/* =========================================================
   CART COUNT
   ========================================================= */

async function getShopifyCartCount() {

  const cart =
    await getShopifyCart();

  return (
    Number(
      cart?.totalQuantity || 0
    )
  );

}


/* =========================================================
   UPDATE CART COUNT
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


  selectors.forEach(
    selector => {

      document
        .querySelectorAll(
          selector
        )
        .forEach(
          element => {

            element.textContent =
              String(count);

          }
        );

    }
  );


  return count;

}


/* =========================================================
   CHECKOUT
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


  /*
   * This remains Shopify Checkout.
   * Payment methods configured inside Shopify
   * remain responsible for payment processing.
   */

  window.location.href =
    cart.checkoutUrl;

}


/* =========================================================
   PRODUCT URL
   ========================================================= */

function getProductUrl(
  product
) {

  if (!product?.handle) {
    return "#";
  }

  return (
    "product.html?handle=" +
    encodeURIComponent(
      product.handle
    )
  );

}


/* =========================================================
   PRODUCT IMAGE
   ========================================================= */

function getProductImage(
  product
) {

  return (
    product?.image ||
    product?.imageUrl ||
    product?.featuredImage?.url ||
    product?.images?.[0]?.url ||
    ""
  );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   GLOBAL SHOPORA PRODUCT API
   ========================================================= */

window.ShoporaProducts = {

  /* Products */

  getAllProducts,
  getProductByHandle,
  getProductById,
  findProduct,
  getAvailableProducts,

  /* Variants */

  getVariantById,
  getDefaultVariant,
  getAvailableVariants,
  applyVariantToProduct,

  /* Cart */

  getShopifyCartId,
  saveShopifyCartId,
  clearShopifyCartId,

  addProductToCart,
  getShopifyCart,
  getShopifyCartCount,
  updateShopifyCartCount,

  updateCartLine,
  removeCartLine,

  /* Checkout */

  goToShopifyCheckout,

  /* Helpers */

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
      .catch(
        error => {

          console.error(
            "Shopora cart count error:",
            error
          );

        }
      );

  }
);
