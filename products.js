/* =========================================================
   SHOPORA MARKET STORE
   products.js
   CENTRAL SHOPIFY PRODUCT + CART + COUNTRY SYSTEM
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

  const result = await response.json();

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
   COUNTRY DATABASE
   ========================================================= */

const SHOPORA_COUNTRY_CODES = {

  US: "USA",
  PK: "Pakistan",
  GB: "UK",
  AE: "UAE",
  CA: "Canada",
  AU: "Australia",
  SA: "Saudi Arabia",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  IN: "India",
  CN: "China",
  JP: "Japan",
  KR: "South Korea",
  MY: "Malaysia",
  SG: "Singapore",
  ID: "Indonesia",
  TH: "Thailand",
  TR: "Turkey",
  NL: "Netherlands",
  BE: "Belgium",
  AT: "Austria",
  CH: "Switzerland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  IE: "Ireland",
  NZ: "New Zealand",
  BR: "Brazil",
  MX: "Mexico",
  AR: "Argentina",
  CL: "Chile",
  ZA: "South Africa",
  EG: "Egypt",
  QA: "Qatar",
  KW: "Kuwait",
  BH: "Bahrain",
  OM: "Oman",
  IL: "Israel",
  PL: "Poland",
  PT: "Portugal",
  GR: "Greece",
  CZ: "Czech Republic",
  RO: "Romania",
  HU: "Hungary",
  UA: "Ukraine",
  PH: "Philippines",
  VN: "Vietnam"
};


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
  SPAIN: "Spain",

  IN: "India",
  INDIA: "India",

  CN: "China",
  CHINA: "China",

  JP: "Japan",
  JAPAN: "Japan",

  KR: "South Korea",
  "SOUTH KOREA": "South Korea",
  KOREA: "South Korea",

  MY: "Malaysia",
  MALAYSIA: "Malaysia",

  SG: "Singapore",
  SINGAPORE: "Singapore",

  ID: "Indonesia",
  INDONESIA: "Indonesia",

  TH: "Thailand",
  THAILAND: "Thailand",

  TR: "Turkey",
  TURKEY: "Turkey",

  NL: "Netherlands",
  NETHERLANDS: "Netherlands",

  BE: "Belgium",
  BELGIUM: "Belgium",

  AT: "Austria",
  AUSTRIA: "Austria",

  CH: "Switzerland",
  SWITZERLAND: "Switzerland",

  SE: "Sweden",
  SWEDEN: "Sweden",

  NO: "Norway",
  NORWAY: "Norway",

  DK: "Denmark",
  DENMARK: "Denmark",

  FI: "Finland",
  FINLAND: "Finland",

  IE: "Ireland",
  IRELAND: "Ireland",

  NZ: "New Zealand",
  "NEW ZEALAND": "New Zealand",

  BR: "Brazil",
  BRAZIL: "Brazil",

  MX: "Mexico",
  MEXICO: "Mexico",

  AR: "Argentina",
  ARGENTINA: "Argentina",

  CL: "Chile",
  CHILE: "Chile",

  ZA: "South Africa",
  "SOUTH AFRICA": "South Africa",

  EG: "Egypt",
  EGYPT: "Egypt",

  QA: "Qatar",
  QATAR: "Qatar",

  KW: "Kuwait",
  KUWAIT: "Kuwait",

  BH: "Bahrain",
  BAHRAIN: "Bahrain",

  OM: "Oman",
  OMAN: "Oman",

  IL: "Israel",
  ISRAEL: "Israel",

  PL: "Poland",
  POLAND: "Poland",

  PT: "Portugal",
  PORTUGAL: "Portugal",

  GR: "Greece",
  GREECE: "Greece",

  CZ: "Czech Republic",
  "CZECH REPUBLIC": "Czech Republic",

  RO: "Romania",
  ROMANIA: "Romania",

  HU: "Hungary",
  HUNGARY: "Hungary",

  UA: "Ukraine",
  UKRAINE: "Ukraine",

  PH: "Philippines",
  PHILIPPINES: "Philippines",

  VN: "Vietnam",
  VIETNAM: "Vietnam"
};


/* =========================================================
   COUNTRY HELPERS
   ========================================================= */

function normalizeCountryCode(value) {

  const code =
    String(value || "")
      .trim()
      .toUpperCase();

  return /^[A-Z]{2}$/.test(code)
    ? code
    : "";
}


function normalizeShippingCountry(value) {

  if (!value) {
    return "";
  }

  const text =
    String(value)
      .trim()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .toUpperCase();

  return (
    SHOPORA_COUNTRY_ALIASES[text] ||
    String(value).trim()
  );
}


function getCountryInfo(value) {

  const raw =
    String(value || "").trim();

  if (!raw) {
    return null;
  }

  const normalized =
    normalizeShippingCountry(raw);

  let code = "";

  if (/^[A-Z]{2}$/.test(raw.toUpperCase())) {

    code =
      raw.toUpperCase();

  } else {

    const found =
      Object.entries(
        SHOPORA_COUNTRY_ALIASES
      ).find(
        ([codeKey, countryName]) =>
          countryName.toUpperCase() ===
          normalized.toUpperCase()
      );

    if (found) {
      code = found[0];
    }
  }

  if (!code) {

    const found =
      Object.entries(
        SHOPORA_COUNTRY_CODES
      ).find(
        ([countryCode, countryName]) =>
          countryName.toUpperCase() ===
          normalized.toUpperCase()
      );

    if (found) {
      code = found[0];
    }
  }

  if (!code) {
    return null;
  }

  return {
    code,
    name:
      SHOPORA_COUNTRY_CODES[code] ||
      normalized
  };
}


/* =========================================================
   SAVED COUNTRY
   ========================================================= */

function getSavedShoporaCountry() {

  return normalizeCountryCode(
    localStorage.getItem(
      SHOPORA_COUNTRY_STORAGE_KEY
    ) || ""
  );
}


function saveShoporaCountry(country) {

  const info =
    getCountryInfo(country);

  if (!info) {
    return "";
  }

  localStorage.setItem(
    SHOPORA_COUNTRY_STORAGE_KEY,
    info.code
  );

  /*
    Tell every Shopora page that the country
    changed.
  */

  try {

    window.dispatchEvent(
      new CustomEvent(
        "shopora:countrychange",
        {
          detail: {
            code: info.code,
            name: info.name
          }
        }
      )
    );

  } catch (error) {

    console.warn(
      "Shopora country event error:",
      error
    );

  }

  return info.code;
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
    await shopifyRequest(query);

  return (
    data?.localization?.availableCountries ||
    []
  );
}


/* =========================================================
   COUNTRY FILTER OPTIONS
   IMPORTANT:
   This is DATA only.
   It does NOT create a product-country filter UI.
   ========================================================= */

async function getShoporaCountryFilterOptions(
  products = []
) {

  const countryMap =
    new Map();

  try {

    const countries =
      await getShopifyAvailableCountries();

    countries.forEach(country => {

      const info =
        getCountryInfo(
          country?.isoCode
        );

      if (!info) {
        return;
      }

      countryMap.set(
        info.code,
        info
      );

    });

  } catch (error) {

    console.warn(
      "Could not load Shopify countries:",
      error
    );

  }


  /*
    Also include actual countries
    detected from products.
  */

  if (Array.isArray(products)) {

    products.forEach(product => {

      getProductShippingCountries(
        product
      ).forEach(country => {

        const info =
          getCountryInfo(country);

        if (!info) {
          return;
        }

        countryMap.set(
          info.code,
          info
        );

      });

    });

  }

  return Array.from(
    countryMap.values()
  ).sort(
    (a, b) =>
      a.name.localeCompare(b.name)
  );
}


/* =========================================================
   EXTRACT SHIPPING COUNTRIES
   ========================================================= */

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

    const fields = [

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

      value.isoCode,
      value.name

    ];

    return fields
      .flatMap(item =>
        extractShippingCountries(item)
      )
      .filter(Boolean);

  }


  return String(value)
    .split(/[,|;/]+/)
    .map(item =>
      normalizeShippingCountry(item)
    )
    .filter(Boolean);
}


/* =========================================================
   PRODUCT SHIPPING COUNTRY DETECTION
   ========================================================= */

function getProductShippingCountries(product) {

  if (!product) {
    return [];
  }

  const countries = [];


  /*
    Direct fields.
    Kept for compatibility with existing
    Shopora product objects.
  */

  const possibleSources = [

    product.shippingCountries,
    product.shipping_countries,

    product.shipToCountries,
    product.ship_to_countries,

    product.shippingCountry,
    product.shipping_country,

    product.shipping,
    product.shippingMethods,
    product.shipping_methods,

    product.shippingData,
    product.shipping_data

  ];


  possibleSources.forEach(source => {

    countries.push(
      ...extractShippingCountries(source)
    );

  });


  /*
    Direct country code.
  */

  if (product.shippingCountryCode) {

    countries.push(
      product.shippingCountryCode
    );

  }


  /*
    Shopify tags.

    Supported:

      ship:PK
      ship:US
      ship:PK,US
      ship:Pakistan|USA

      ships_to:PK,US
      shipping:PK,US
      shipping_to:PK,US
  */

  const tags =
    Array.isArray(product.tags)
      ? product.tags
      : [];


  tags.forEach(tag => {

    const text =
      String(tag || "").trim();

    if (!text) {
      return;
    }


    const match =
      text.match(
        /^(ship|ships_to|shipping|shipping_to)\s*[:=]\s*(.+)$/i
      );

    if (!match) {
      return;
    }


    countries.push(
      ...extractShippingCountries(
        match[2]
      )
    );

  });


  /*
    Some agent/product systems may use
    a tag such as:

      Ship To: Pakistan, USA

    Support that too.
  */

  tags.forEach(tag => {

    const text =
      String(tag || "").trim();

    const match =
      text.match(
        /^ship\s*to\s*[:=]\s*(.+)$/i
      );

    if (!match) {
      return;
    }

    countries.push(
      ...extractShippingCountries(
        match[1]
      )
    );

  });


  /*
    Normalize and convert to canonical names.
  */

  const normalized =
    countries
      .flatMap(country =>
        extractShippingCountries(country)
      )
      .map(country =>
        getCountryInfo(country)
      )
      .filter(Boolean)
      .map(info =>
        info.name
      );

  return Array.from(
    new Set(normalized)
  );
}


/* =========================================================
   PRODUCT SHIPS TO COUNTRY
   ========================================================= */

function productShipsToCountry(
  product,
  country = ""
) {

  if (!product) {
    return false;
  }

  const selected =
    getCountryInfo(country);

  if (!selected) {
    return true;
  }

  const productCountries =
    getProductShippingCountries(product);


  /*
    IMPORTANT:

    We never assume that the selected country
    is automatically a shipping country.

    The product must actually contain the
    country information.
  */

  if (!productCountries.length) {
    return false;
  }


  return productCountries.some(
    item => {

      const info =
        getCountryInfo(item);

      return (
        info?.code ===
        selected.code
      );

    }
  );
}


/* =========================================================
   FILTER PRODUCTS BY COUNTRY
   ========================================================= */

function filterProductsByShippingCountry(
  products,
  country = ""
) {

  if (!Array.isArray(products)) {
    return [];
  }

  const selected =
    getCountryInfo(country);

  if (!selected) {
    return products;
  }

  return products.filter(
    product =>
      productShipsToCountry(
        product,
        selected.code
      )
  );
}


/* =========================================================
   SHOPIFY COUNTRY CONTEXT
   ========================================================= */

function buildCountryDirective(country) {

  const code =
    normalizeCountryCode(country);

  return code
    ? ` @inContext(country: ${code})`
    : "";
}


/* =========================================================
   PRODUCT GRAPHQL FIELDS
   ========================================================= */

const PRODUCT_QUERY_FIELDS = `

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

`;


/* =========================================================
   GET ALL PRODUCTS
   ========================================================= */

async function getAllProducts(options = {}) {

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
    buildCountryDirective(country);


  const query = `
    query GetProducts${countryDirective} {

      products(first: ${first}) {

        edges {

          node {

            ${PRODUCT_QUERY_FIELDS}

          }

        }

      }

    }
  `;


  const data =
    await shopifyRequest(query);


  const edges =
    data?.products?.edges || [];


  const products =
    edges.map(edge =>
      normalizeShopifyProduct(
        edge.node
      )
    );


  /*
    IMPORTANT:

    If a country is selected, return ONLY
    products that actually ship there.
  */

  if (country) {

    return filterProductsByShippingCountry(
      products,
      country
    );

  }


  return products;
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

      product(handle: $handle) {

        ${PRODUCT_QUERY_FIELDS}

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


  const product =
    normalizeShopifyProduct(
      data.product
    );


  /*
    Product page also respects selected country.
  */

  if (
    selectedCountry &&
    !productShipsToCountry(
      product,
      selectedCountry
    )
  ) {

    return null;

  }


  return product;
}


/* =========================================================
   NORMALIZE SHOPIFY PRODUCT
   ========================================================= */

function normalizeShopifyProduct(product) {

  const variants =
    (
      product?.variants?.edges ||
      []
    )
      .map(edge => edge.node)
      .filter(Boolean);


  const images =
    (
      product?.images?.edges ||
      []
    )
      .map(edge => edge.node)
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


  const shippingCountries =
    getProductShippingCountries(
      product
    );


  const shippingInfo =
    shippingCountries.map(
      country =>
        getCountryInfo(country)
    )
    .filter(Boolean);


  return {

    /* Identity */

    id:
      product?.id || "",

    shopifyId:
      product?.id || "",

    handle:
      product?.handle || "",


    /* Product */

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


    /* Actual shipping countries */

    shippingCountries,

    shippingCountryCodes:
      shippingInfo.map(
        info => info.code
      ),

    shippingCountryCode:
      shippingInfo.length === 1
        ? shippingInfo[0].code
        : "",


    /* Images */

    image:
      featuredImage?.url || "",

    imageUrl:
      featuredImage?.url || "",

    featuredImage,

    images,


    /* Variants */

    variants,

    variant:
      defaultVariant,

    variantId:
      defaultVariant?.id || null,


    /* Price */

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
   VARIANTS
   ========================================================= */

function getVariantById(
  product,
  variantId
) {

  if (!product || !variantId) {
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
   PRICE
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
   PRODUCT BY ID
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
   CART QUERY
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

  buyerIdentity {

    countryCode

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

`;


/* =========================================================
   CREATE SHOPIFY CART
   WITH SELECTED COUNTRY
   ========================================================= */

async function createShopifyCart(
  variantId,
  quantity = 1,
  country = ""
) {

  if (!variantId) {

    throw new Error(
      "Shopify variant ID is missing."
    );

  }


  const selectedCountry =
    normalizeCountryCode(
      country ||
      getSavedShoporaCountry()
    );


  const mutation = `

    mutation CreateCart(
      $lines: [CartLineInput!]
      $buyerIdentity: CartBuyerIdentityInput
    ) {

      cartCreate(

        input: {
          lines: $lines
          buyerIdentity: $buyerIdentity
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


  const buyerIdentity =
    selectedCountry
      ? {
          countryCode:
            selectedCountry
        }
      : undefined;


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

        ],

        buyerIdentity

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
   UPDATE CART COUNTRY
   ========================================================= */

async function updateShopifyCartCountry(
  cartId,
  country
) {

  if (!cartId) {
    return null;
  }


  const selectedCountry =
    normalizeCountryCode(
      country
    );


  if (!selectedCountry) {
    return null;
  }


  const mutation = `

    mutation UpdateCartBuyerIdentity(
      $cartId: ID!
      $buyerIdentity: CartBuyerIdentityInput!
    ) {

      cartBuyerIdentityUpdate(

        cartId: $cartId

        buyerIdentity:
          $buyerIdentity

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

        buyerIdentity: {
          countryCode:
            selectedCountry
        }

      }
    );


  const payload =
    data?.cartBuyerIdentityUpdate;


  if (
    payload?.userErrors?.length
  ) {

    throw new Error(
      payload.userErrors[0].message
    );

  }


  return payload?.cart || null;
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

      $cartId: ID!

      $lines: [CartLineInput!]!

    ) {

      cartLinesAdd(

        cartId: $cartId

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

  const selectedCountry =
    getSavedShoporaCountry();


  if (
    typeof product === "string"
  ) {

    product =
      await getProductById(
        product,
        selectedCountry
      );

  }


  if (!product) {

    throw new Error(
      "Product not found for the selected country."
    );

  }


  /*
    HARD COUNTRY CHECK
  */

  if (
    selectedCountry &&
    !productShipsToCountry(
      product,
      selectedCountry
    )
  ) {

    throw new Error(
      "This product does not ship to your selected country."
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


  /*
    Existing cart.
  */

  if (cartId) {

    try {

      /*
        Make sure the existing cart uses
        the currently selected country.
      */

      await updateShopifyCartCountry(
        cartId,
        selectedCountry
      );


      return await addToShopifyCart(
        cartId,
        finalVariantId,
        finalQuantity
      );

    } catch (error) {

      console.warn(
        "Existing Shopify cart failed. Creating a new country-aware cart.",
        error
      );


      clearShopifyCartId();

    }

  }


  /*
    New cart with country.
  */

  return createShopifyCart(
    finalVariantId,
    finalQuantity,
    selectedCountry
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


    /*
      Keep cart country synchronized.
    */

    const selectedCountry =
      getSavedShoporaCountry();


    const cartCountry =
      normalizeCountryCode(
        cart?.buyerIdentity?.countryCode
      );


    if (
      selectedCountry &&
      cartCountry !== selectedCountry
    ) {

      try {

        const updated =
          await updateShopifyCartCountry(
            cart.id,
            selectedCountry
          );

        if (updated) {
          return updated;
        }

      } catch (countryError) {

        console.warn(
          "Could not update cart country:",
          countryError
        );

      }

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
    !Number.isFinite(finalQuantity) ||
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

      $cartId: ID!

      $lines: [CartLineUpdateInput!]!

    ) {

      cartLinesUpdate(

        cartId: $cartId

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

      $cartId: ID!

      $lineIds: [ID!]!

    ) {

      cartLinesRemove(

        cartId: $cartId

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
          String(count);

      });

  });


  return count;
}


/* =========================================================
   COUNTRY CHANGE
   ========================================================= */

async function handleShoporaCountryChange(
  country
) {

  const selected =
    saveShoporaCountry(
      country
    );


  if (!selected) {
    return false;
  }


  /*
    Update current cart country too.
  */

  const cartId =
    getShopifyCartId();


  if (cartId) {

    try {

      await updateShopifyCartCountry(
        cartId,
        selected
      );

    } catch (error) {

      console.warn(
        "Shopora cart country update failed:",
        error
      );

    }

  }


  return selected;
}


/* =========================================================
   CHECKOUT
   ========================================================= */

async function goToShopifyCheckout() {

  const selectedCountry =
    getSavedShoporaCountry();


  let cart =
    await getShopifyCart();


  if (!cart?.checkoutUrl) {

    alert(
      "Your cart is empty. Please add a product first."
    );

    return;

  }


  /*
    Final country synchronization before checkout.
  */

  if (selectedCountry) {

    const cartCountry =
      normalizeCountryCode(
        cart?.buyerIdentity?.countryCode
      );


    if (
      cartCountry !== selectedCountry
    ) {

      try {

        const updated =
          await updateShopifyCartCountry(
            cart.id,
            selectedCountry
          );

        if (updated) {
          cart = updated;
        }

      } catch (error) {

        console.error(
          "Checkout country update failed:",
          error
        );

      }

    }

  }


  window.location.href =
    cart.checkoutUrl;
}


/* =========================================================
   PRODUCT URL
   ========================================================= */

function getProductUrl(product) {

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

function getProductImage(product) {

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

function escapeHtml(value) {

  return String(
    value ?? ""
  )

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

  /* Products */

  getAllProducts,
  getProductByHandle,
  getProductById,
  findProduct,
  getAvailableProducts,


  /* Countries */

  getShopifyAvailableCountries,
  getShoporaCountryFilterOptions,

  normalizeCountryCode,
  normalizeShippingCountry,
  getCountryInfo,

  getSavedShoporaCountry,
  saveShoporaCountry,

  handleShoporaCountryChange,


  /* Shipping */

  getProductShippingCountries,
  productShipsToCountry,
  filterProductsByShippingCountry,


  /* Variants */

  getVariantById,
  getDefaultVariant,
  getAvailableVariants,
  applyVariantToProduct,


  /* Cart */

  getShopifyCartId,
  saveShopifyCartId,
  clearShopifyCartId,

  createShopifyCart,
  updateShopifyCartCountry,
  addToShopifyCart,
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
      .catch(error => {

        console.error(
          "Shopora cart count error:",
          error
        );

      });

  }
);


/* =========================================================
   LISTEN FOR COUNTRY CHANGES
   ========================================================= */

window.addEventListener(
  "shopora:countrychange",
  async () => {

    try {

      await updateShopifyCartCount();

    } catch (error) {

      console.warn(
        "Shopora country-change refresh error:",
        error
      );

    }

  }
);
