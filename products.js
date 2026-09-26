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

const SHOPORA_COUNTRY_STORAGE_KEY =
  "shoporaShippingCountry";


/* =========================================================
   SHOPIFY GRAPHQL REQUEST
   ========================================================= */

async function shopifyRequest(
  query,
  variables = {}
) {

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
   COUNTRY HELPERS
   ========================================================= */

function normalizeCountryCode(
  value
) {

  const code =
    String(value || "")
      .trim()
      .toUpperCase();


  return /^[A-Z]{2}$/.test(code)
    ? code
    : "";

}


function getSavedShoporaCountry() {

  return normalizeCountryCode(
    localStorage.getItem(
      SHOPORA_COUNTRY_STORAGE_KEY
    ) || ""
  );

}


function saveShoporaCountry(
  country
) {

  const code =
    normalizeCountryCode(
      country
    );


  if (code) {

    localStorage.setItem(
      SHOPORA_COUNTRY_STORAGE_KEY,
      code
    );

  }


  return code;

}


/* =========================================================
   GET SHOPIFY AVAILABLE COUNTRIES
   ========================================================= */

async function getShopifyAvailableCountries() {

  const query = `
    query GetAvailableCountries {

      localization {

        availableCountries {

          isoCode
          name

        }

      }

    }
  `;


  const data =
    await shopifyRequest(
      query
    );


  return (
    data?.localization?.availableCountries ||
    []
  );

}


/* =========================================================
   SHOPIFY COUNTRY CONTEXT
   ========================================================= */

function buildCountryDirective(
  country
) {

  const code =
    normalizeCountryCode(
      country
    );


  return code
    ? ` @inContext(country: ${code})`
    : "";

}


/* =========================================================
   GET ALL PRODUCTS
   ========================================================= */

async function getAllProducts(
  options = {}
) {

  const first =
    Math.min(
      Number(options.first) || 50,
      250
    );


  const country =
    normalizeCountryCode(
      options.country ||
      getSavedShoporaCountry()
    );


  const countryDirective =
    buildCountryDirective(
      country
    );


  const query = `
    query GetProducts${countryDirective} {

      products(
        first: ${first}
      ) {

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


            images(
              first: 20
            ) {

              edges {

                node {

                  url
                  altText
                  width
                  height

                }

              }

            }


            variants(
              first: 100
            ) {

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
      query
    );


  const edges =
    data?.products?.edges ||
    [];


  return edges.map(
    edge =>
      normalizeShopifyProduct(
        edge.node,
        country
      )
  );

}


/* =========================================================
   GET PRODUCT BY HANDLE
   ========================================================= */

async function getProductByHandle(
  handle,
  country = ""
) {

  if (!handle) {
    return null;
  }


  const selectedCountry =
    normalizeCountryCode(
      country ||
      getSavedShoporaCountry()
    );


  const countryDirective =
    buildCountryDirective(
      selectedCountry
    );


  const query = `
    query GetProductByHandle${countryDirective}(
      $handle: String!
    ) {

      product(
        handle: $handle
      ) {

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


        images(
          first: 20
        ) {

          edges {

            node {

              url
              altText
              width
              height

            }

          }

        }


        variants(
          first: 100
        ) {

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
      {
        handle
      }
    );


  if (!data?.product) {
    return null;
  }


  return normalizeShopifyProduct(
    data.product,
    selectedCountry
  );

}


/* =========================================================
   SHIPPING COUNTRY ALIASES
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


/* =========================================================
   NORMALIZE SHIPPING COUNTRY
   ========================================================= */

function normalizeShippingCountry(
  value
) {

  if (!value) {
    return "";
  }


  const text =
    String(value)
      .trim()
      .replace(
        /[_-]+/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .toUpperCase();


  return (
    SHOPORA_COUNTRY_ALIASES[text] ||
    String(value).trim()
  );

}


/* =========================================================
   EXTRACT SHIPPING COUNTRIES
   ========================================================= */

function extractShippingCountries(
  value
) {

  if (!value) {
    return [];
  }


  if (Array.isArray(value)) {

    return value
      .flatMap(
        item =>
          extractShippingCountries(
            item
          )
      )
      .filter(Boolean);

  }


  if (
    typeof value === "object"
  ) {

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
      .flatMap(
        item =>
          extractShippingCountries(
            item
          )
      )
      .filter(Boolean);

  }


  return String(value)
    .split(
      /[,|;/]+/
    )
    .map(
      item =>
        normalizeShippingCountry(
          item
        )
    )
    .filter(Boolean);

}


/* =========================================================
   GET PRODUCT SHIPPING COUNTRIES
   ========================================================= */

function getProductShippingCountries(
  product
) {

  const countries = [];


  if (
    product?.shippingCountryCode
  ) {

    countries.push(
      product.shippingCountryCode
    );

  }


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


  for (
    const source of possibleSources
  ) {

    countries.push(
      ...extractShippingCountries(
        source
      )
    );

  }


  const tags =
    Array.isArray(product?.tags)
      ? product.tags
      : [];


  for (
    const tag of tags
  ) {

    const text =
      String(tag || "").trim();


    if (
      text
        .toLowerCase()
        .startsWith("ship:")
    ) {

      countries.push(
        text
          .slice(5)
          .trim()
      );

    }

  }


  return Array.from(
    new Set(
      countries
        .map(
          country =>
            normalizeShippingCountry(
              country
            )
        )
        .filter(Boolean)
    )
  );

}


/* =========================================================
   PRODUCT SHIPS TO COUNTRY
   ========================================================= */

function productShipsToCountry(
  product,
  country = "USA"
) {

  const selected =
    normalizeShippingCountry(
      country
    );


  if (!selected) {
    return false;
  }


  return getProductShippingCountries(
    product
  ).some(
    item =>
      normalizeShippingCountry(
        item
      ) === selected
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


/* =========================================================
   NORMALIZE SHOPIFY PRODUCT
   ========================================================= */

function normalizeShopifyProduct(
  product,
  countryCode = ""
) {

  const variants =
    (
      product?.variants?.edges ||
      []
    )
      .map(
        edge =>
          edge.node
      )
      .filter(Boolean);


  const images =
    (
      product?.images?.edges ||
      []
    )
      .map(
        edge =>
          edge.node
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


  const normalizedCountry =
    normalizeCountryCode(
      countryCode
    );


  const shippingCountries =
    normalizedCountry
      ? [
          normalizeShippingCountry(
            normalizedCountry
          )
        ]
      : getProductShippingCountries(
          product
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


    /* Country */

    shippingCountryCode:
      normalizedCountry,

    shippingCountries,


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
      defaultVariant?.id ||
      null,


    /* Price */

    price:
      Number(
        defaultVariant?.price?.amount ||
        0
      ),

    priceAmount:
      defaultVariant?.price?.amount ||
      "0",

    currency:
      defaultVariant?.price?.currencyCode ||
      "PKR",

    formattedPrice:
      formatProductPrice(
        defaultVariant?.price?.amount ||
        0,

        defaultVariant?.price?.currencyCode ||
        "PKR"
      ),


    compareAtPrice:
      defaultVariant?.compareAtPrice?.amount
        ? Number(
            defaultVariant
              .compareAtPrice
              .amount
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
      Storefront API does not expose
      private inventory quantity.
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

function getDefaultVariant(
  product
) {

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

function getAvailableVariants(
  product
) {

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
            variant
              .compareAtPrice
              .amount
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
    Number(
      amount || 0
    );


  try {

    return new Intl.NumberFormat(
      "en-PK",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0
      }
    ).format(
      numericAmount
    );

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

async function getProductById(
  productId,
  country = ""
) {

  if (!productId) {
    return null;
  }


  const products =
    await getAllProducts(
      {
        first: 250,
        country
      }
    );


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
  identifier,
  country = ""
) {

  if (!identifier) {
    return null;
  }


  if (
    typeof identifier === "string" &&
    identifier.startsWith("gid://")
  ) {

    return getProductById(
      identifier,
      country
    );

  }


  return getProductByHandle(
    identifier,
    country
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
      product.buyable &&
      product.variantId
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
   CART QUERY FIELDS
   ========================================================= */

const CART_QUERY_FIELDS = `

  id

  checkoutUrl

  totalQuantity


  cost {

    totalAmount {

      amount
      currencyCode

    }

  }


  lines(
    first: 100
  ) {

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

`;


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

          ${CART_QUERY_FIELDS}

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

          ${CART_QUERY_FIELDS}

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
   ========================================================= */

async function addProductToCart(
  product,
  quantity = 1,
  variantId = null
) {

  if (
    typeof product === "string"
  ) {

    product =
      await getProductById(
        product
      );

  }


  if (!product) {

    throw new Error(
      "Product not found."
    );

  }


  let selectedProduct =
    product;


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
    selectedProduct.availableForSale ===
    false
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


  return createShopifyCart(
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

      cart(
        id: $cartId
      ) {

        ${CART_QUERY_FIELDS}

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


  if (
    !Number.isFinite(
      finalQuantity
    ) ||
    finalQuantity < 1
  ) {

    return removeCartLine(
      lineId
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

    mutation UpdateCartLines(

      $cartId: ID!,

      $lines: [CartLineUpdateInput!]!

    ) {

      cartLinesUpdate(

        cartId: $cartId,

        lines: $lines

      ) {

        cart {

          ${CART_QUERY_FIELDS}

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
            id:
              lineId,

            quantity:
              finalQuantity
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

          ${CART_QUERY_FIELDS}

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


  return Number(
    cart?.totalQuantity || 0
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

  getShopifyAvailableCountries,


  /* Country */

  normalizeCountryCode,

  getSavedShoporaCountry,

  saveShoporaCountry,


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


  /* Shipping */

  getProductShippingCountries,

  productShipsToCountry,

  filterProductsByShippingCountry,


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
