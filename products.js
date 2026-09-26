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

const SHOPORA_COUNTRY_CACHE_KEY =
  "shoporaAvailableProductCountries";

const SHOPORA_COUNTRY_CACHE_TIME_KEY =
  "shoporaAvailableProductCountriesTime";

const SHOPORA_COUNTRY_CACHE_DURATION =
  30 * 60 * 1000;


/* =========================================================
   SHOPIFY GRAPHQL REQUEST
   ========================================================= */

async function shopifyRequest(
  query,
  variables = {}
) {

  const response =
    await fetch(
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

  try {

    return normalizeCountryCode(
      localStorage.getItem(
        SHOPORA_COUNTRY_STORAGE_KEY
      ) || ""
    );

  } catch {

    return "";

  }

}


function saveShoporaCountry(
  country
) {

  const code =
    normalizeCountryCode(
      country
    );


  try {

    if (code) {

      localStorage.setItem(
        SHOPORA_COUNTRY_STORAGE_KEY,
        code
      );

    }

  } catch {

    /* Ignore localStorage errors */

  }


  return code;

}


/* =========================================================
   COUNTRY NAME / CODE INFORMATION
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
   COUNTRY INFO
   ========================================================= */

function getCountryInfo(
  value
) {

  const raw =
    String(value || "")
      .trim();


  if (!raw) {
    return null;
  }


  const normalized =
    normalizeShippingCountry(
      raw
    );


  const upper =
    raw
      .replace(
        /[_-]+/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim()
      .toUpperCase();


  let code = "";


  if (
    /^[A-Z]{2}$/.test(
      upper
    )
  ) {

    code = upper;

  } else {

    for (
      const [
        countryCode,
        countryName
      ] of Object.entries(
        SHOPORA_COUNTRY_ALIASES
      )
    ) {

      if (
        countryName ===
        normalized
      ) {

        if (
          /^[A-Z]{2}$/.test(
            countryCode
          )
        ) {

          code =
            countryCode;

          break;

        }

      }

    }

  }


  if (!code) {

    const found =
      Object.entries(
        SHOPORA_COUNTRY_CODES
      ).find(
        ([countryCode, name]) =>
          String(name)
            .toUpperCase() ===
          normalized.toUpperCase()
      );


    if (found) {

      code =
        found[0];

    }

  }


  if (!code) {

    return {

      code:
        normalized
          .toUpperCase()
          .replace(
            /[^A-Z]/g,
            ""
          )
          .slice(
            0,
            2
          ),

      name:
        normalized

    };

  }


  return {

    code,

    name:
      SHOPORA_COUNTRY_CODES[code] ||
      normalized

  };

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

      value.isoCode,

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

  if (!product) {
    return [];
  }


  const countries = [];


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


  for (
    const source of possibleSources
  ) {

    countries.push(
      ...extractShippingCountries(
        source
      )
    );

  }


  if (
    product.shippingCountryCode
  ) {

    countries.push(
      product.shippingCountryCode
    );

  }


  /*
    Shopify product tags.

    Examples:

    ship:US
    ship:USA
    ship:Pakistan
    ship:US,PK,GB
    ships_to:US,PK
    shipping:US,PK
  */

  const tags =
    Array.isArray(
      product.tags
    )
      ? product.tags
      : [];


  tags.forEach(
    tag => {

      const text =
        String(
          tag || ""
        ).trim();


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
          match[2].trim()
        )
      );

    }
  );


  const normalized =
    countries
      .flatMap(
        country =>
          extractShippingCountries(
            country
          )
      )
      .map(
        country =>
          normalizeShippingCountry(
            country
          )
      )
      .map(
        country =>
          country.trim()
      )
      .filter(Boolean);


  return Array.from(
    new Set(
      normalized
    )
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
    normalizeShippingCountry(
      country
    );


  if (!selected) {
    return true;
  }


  const productCountries =
    getProductShippingCountries(
      product
    );


  /*
    If explicit shipping countries exist,
    they are authoritative.
  */

  if (
    productCountries.length > 0
  ) {

    return productCountries.some(
      item =>
        normalizeShippingCountry(
          item
        ) === selected
    );

  }


  /*
    No explicit shipping data means
    country availability from Shopify
    context is used by getAllProducts().
  */

  return true;

}


/* =========================================================
   FILTER PRODUCTS BY SHIPPING COUNTRY
   ========================================================= */

function filterProductsByShippingCountry(
  products,
  country = ""
) {

  if (!Array.isArray(products)) {
    return [];
  }


  const selected =
    normalizeShippingCountry(
      country
    );


  if (!selected) {
    return products;
  }


  return products.filter(
    product =>
      productShipsToCountry(
        product,
        selected
      )
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
   PRODUCT GRAPHQL FIELDS
   ========================================================= */

const SHOPORA_PRODUCT_FIELDS = `

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

`;


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

            ${SHOPORA_PRODUCT_FIELDS}

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


  const products =
    edges.map(
      edge =>
        normalizeShopifyProduct(
          edge.node
        )
    );


  /*
    If explicit shipping tags/data exist,
    apply those filters too.
  */

  if (country) {

    return products.filter(
      product => {

        const explicitCountries =
          getProductShippingCountries(
            product
          );


        /*
          No explicit shipping information:
          keep the product because Shopify's
          @inContext(country) already controls
          country-specific product availability.
        */

        if (
          explicitCountries.length === 0
        ) {

          return true;

        }


        return explicitCountries.some(
          item =>
            normalizeShippingCountry(
              item
            ) ===
            normalizeShippingCountry(
              country
            )
        );

      }
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

      product(
        handle: $handle
      ) {

        ${SHOPORA_PRODUCT_FIELDS}

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
    Respect explicit shipping data.
  */

  if (
    selectedCountry &&
    getProductShippingCountries(
      product
    ).length > 0 &&
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

function normalizeShopifyProduct(
  product
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


  const shippingCountries =
    getProductShippingCountries(
      product
    );


  return {

    id:
      product?.id || "",

    shopifyId:
      product?.id || "",

    handle:
      product?.handle || "",


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


    shippingCountryCode:
      shippingCountries.length === 1
        ? (
            getCountryInfo(
              shippingCountries[0]
            )?.code || ""
          )
        : "",

    shippingCountries,


    image:
      featuredImage?.url || "",

    imageUrl:
      featuredImage?.url || "",

    featuredImage,

    images,


    variants,


    variant:
      defaultVariant,

    variantId:
      defaultVariant?.id ||
      null,


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
   COUNTRY-SPECIFIC PRODUCT CHECK
   ========================================================= */

/*
   This is the important new part.

   Shopify localization.availableCountries can contain
   countries that are enabled in the store/market.

   We do NOT automatically put all of them in the
   Shopora country dropdown.

   Instead we check products under each country's
   Shopify @inContext(country: XX).

   A country is added only if at least one product is:

   - availableForSale
   - has an available variant
   - has a valid variant ID
*/

async function getProductsForCountry(
  countryCode
) {

  const code =
    normalizeCountryCode(
      countryCode
    );


  if (!code) {
    return [];
  }


  try {

    const products =
      await getAllProducts({
        first: 250,
        country: code
      });


    return products.filter(
      product =>
        product?.buyable &&
        product?.variantId
    );

  } catch (error) {

    console.warn(
      `Could not check products for country ${code}:`,
      error
    );


    return [];

  }

}


/* =========================================================
   GET COUNTRIES THAT ACTUALLY HAVE PRODUCTS
   ========================================================= */

async function getProductAvailableCountries(
  forceRefresh = false
) {

  /*
    Read cache first.
  */

  if (!forceRefresh) {

    try {

      const cached =
        JSON.parse(
          localStorage.getItem(
            SHOPORA_COUNTRY_CACHE_KEY
          ) || "[]"
        );


      const cachedTime =
        Number(
          localStorage.getItem(
            SHOPORA_COUNTRY_CACHE_TIME_KEY
          ) || 0
        );


      if (
        Array.isArray(cached) &&
        cached.length &&
        Date.now() - cachedTime <
          SHOPORA_COUNTRY_CACHE_DURATION
      ) {

        return cached;

      }

    } catch {

      /* Ignore invalid cache */

    }

  }


  /*
    Get Shopify's enabled countries first.
  */

  let availableCountries = [];


  try {

    availableCountries =
      await getShopifyAvailableCountries();

  } catch (error) {

    console.error(
      "Could not load Shopify country list:",
      error
    );

    return [];

  }


  const countryResults = [];


  /*
    Check countries in small parallel batches.
    This avoids sending hundreds of requests at once.
  */

  const BATCH_SIZE = 6;


  for (
    let i = 0;
    i < availableCountries.length;
    i += BATCH_SIZE
  ) {

    const batch =
      availableCountries.slice(
        i,
        i + BATCH_SIZE
      );


    const results =
      await Promise.all(
        batch.map(
          async country => {

            const code =
              normalizeCountryCode(
                country?.isoCode
              );


            if (!code) {
              return null;
            }


            const products =
              await getProductsForCountry(
                code
              );


            if (
              !products.length
            ) {

              return null;

            }


            return {

              code,

              name:
                country?.name ||
                SHOPORA_COUNTRY_CODES[code] ||
                code

            };

          }
        )
      );


    results.forEach(
      result => {

        if (result) {

          countryResults.push(
            result
          );

        }

      }
    );

  }


  /*
    Sort alphabetically.
  */

  countryResults.sort(
    (a, b) =>
      String(a.name)
        .localeCompare(
          String(b.name)
        )
  );


  /*
    Save cache.
  */

  try {

    localStorage.setItem(
      SHOPORA_COUNTRY_CACHE_KEY,
      JSON.stringify(
        countryResults
      )
    );


    localStorage.setItem(
      SHOPORA_COUNTRY_CACHE_TIME_KEY,
      String(
        Date.now()
      )
    );

  } catch {

    /* Ignore localStorage errors */

  }


  return countryResults;

}


/* =========================================================
   GET SHOPORA COUNTRY FILTER OPTIONS
   ========================================================= */

async function getShoporaCountryFilterOptions(
  products = []
) {

  /*
    IMPORTANT:

    Do not return all Shopify countries.

    Return only countries where Shopify has at
    least one buyable product.
  */

  try {

    const countries =
      await getProductAvailableCountries();


    if (
      countries.length
    ) {

      return countries;

    }

  } catch (error) {

    console.warn(
      "Country product availability check failed:",
      error
    );

  }


  /*
    Fallback:

    If country checking fails, use explicit
    shipping countries from already-loaded products.
  */

  const countryMap =
    new Map();


  if (Array.isArray(products)) {

    products.forEach(
      product => {

        const countries =
          getProductShippingCountries(
            product
          );


        countries.forEach(
          country => {

            const info =
              getCountryInfo(
                country
              );


            if (
              info?.code &&
              info?.name
            ) {

              countryMap.set(
                info.code,
                info
              );

            }

          }
        );

      }
    );

  }


  return Array.from(
    countryMap.values()
  ).sort(
    (a, b) =>
      a.name.localeCompare(
        b.name
      )
  );

}


/* =========================================================
   CLEAR COUNTRY CACHE
   ========================================================= */

function clearShoporaCountryCache() {

  try {

    localStorage.removeItem(
      SHOPORA_COUNTRY_CACHE_KEY
    );

    localStorage.removeItem(
      SHOPORA_COUNTRY_CACHE_TIME_KEY
    );

  } catch {

    /* Ignore localStorage errors */

  }

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

  try {

    return localStorage.getItem(
      SHOPORA_CART_STORAGE_KEY
    );

  } catch {

    return null;

  }

}


function saveShopifyCartId(
  cartId
) {

  if (!cartId) {
    return;
  }


  try {

    localStorage.setItem(
      SHOPORA_CART_STORAGE_KEY,
      cartId
    );

  } catch {

    /* Ignore localStorage errors */

  }

}


function clearShopifyCartId() {

  try {

    localStorage.removeItem(
      SHOPORA_CART_STORAGE_KEY
    );

  } catch {

    /* Ignore localStorage errors */

  }

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


  /* Countries */

  getShopifyAvailableCountries,

  getShoporaCountryFilterOptions,

  getProductAvailableCountries,

  clearShoporaCountryCache,


  /* Country */

  normalizeCountryCode,

  normalizeShippingCountry,

  getCountryInfo,

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
