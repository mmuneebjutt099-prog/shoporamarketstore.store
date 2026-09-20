/* =========================================================
   SHOPORA MARKET STORE
   SHOPIFY STOREFRONT PRODUCT DATA
   File: products.js
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     SHOPIFY CONFIG
     ========================================================= */

  const SHOPIFY_DOMAIN = "fsgigg-tp.myshopify.com";

  /*
    IMPORTANT:
    Paste your Shopify PUBLIC Storefront API token here.

    Do NOT use:
    - Client Secret
    - Admin API token
    - App automation token
    - Private Storefront token
  */
  const SHOPIFY_STOREFRONT_TOKEN = "b00f8861faa3611c651415d574bf0095";

  const SHOPIFY_API_VERSION = "2026-07";

  const SHOPIFY_ENDPOINT =
    "https://" +
    SHOPIFY_DOMAIN +
    "/api/" +
    SHOPIFY_API_VERSION +
    "/graphql.json";


  /* =========================================================
     SHOPIFY GRAPHQL REQUEST
     ========================================================= */

  async function shopifyRequest(query, variables) {
    const response = await fetch(SHOPIFY_ENDPOINT, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token":
          SHOPIFY_STOREFRONT_TOKEN
      },

      body: JSON.stringify({
        query: query,
        variables: variables || {}
      })
    });

    if (!response.ok) {
      throw new Error(
        "Shopify API request failed: " + response.status
      );
    }

    const result = await response.json();

    if (result.errors && result.errors.length) {
      console.error("Shopify GraphQL errors:", result.errors);

      throw new Error(
        result.errors[0].message || "Shopify GraphQL error"
      );
    }

    return result.data;
  }


  /* =========================================================
     CONVERT SHOPIFY PRODUCT → SHOPORA PRODUCT FORMAT
     ========================================================= */

  function convertShopifyProduct(product) {
    if (!product) return null;

    const variants =
      product.variants &&
      product.variants.nodes
        ? product.variants.nodes
        : [];

    const firstVariant =
      variants.find(function (variant) {
        return variant.availableForSale;
      }) || variants[0] || null;

    const firstImage =
      product.images &&
      product.images.nodes &&
      product.images.nodes.length
        ? product.images.nodes[0]
        : null;

    const image =
      firstImage && firstImage.url
        ? firstImage.url
        : "assets/shopora-mark.png";

    let category = "Lifestyle";

    if (
      product.productType &&
      String(product.productType).trim()
    ) {
      category = product.productType;
    } else if (
      product.collections &&
      product.collections.nodes &&
      product.collections.nodes.length
    ) {
      category =
        product.collections.nodes[0].title || "Lifestyle";
    }

    const price =
      firstVariant &&
      firstVariant.price &&
      firstVariant.price.amount
        ? Number(firstVariant.price.amount)
        : 0;

    const available =
      firstVariant &&
      typeof firstVariant.availableForSale !== "undefined"
        ? firstVariant.availableForSale
        : false;

    return {
      id: product.id,
      shopifyId: product.id,

      handle: product.handle,

      name: product.title,

      title: product.title,

      category: category,

      price: price,

      currency:
        firstVariant &&
        firstVariant.price &&
        firstVariant.price.currencyCode
          ? firstVariant.price.currencyCode
          : "PKR",

      image: image,

      images:
        product.images &&
        product.images.nodes
          ? product.images.nodes.map(function (item) {
              return item.url;
            })
          : [image],

      description:
        product.description ||
        product.descriptionHtml ||
        "",

      badge: available ? "Available" : "Sold Out",

      buyable: available,

      stock: available ? 999 : 0,

      sku:
        firstVariant && firstVariant.sku
          ? firstVariant.sku
          : "",

      seller: "Shopora Market Store",

      status: "active",

      variantId:
        firstVariant && firstVariant.id
          ? firstVariant.id
          : null,

      variants:
        product.variants &&
        product.variants.nodes
          ? product.variants.nodes
          : []
    };
  }


  /* =========================================================
     FETCH ALL SHOPIFY PRODUCTS
     ========================================================= */

  async function fetchShopifyProducts(options) {
    options = options || {};

    const first =
      Number(options.first) > 0
        ? Number(options.first)
        : 50;

    const query = `
      query GetProducts($first: Int!) {
        products(first: $first) {
          nodes {
            id
            handle
            title
            description
            descriptionHtml
            productType

            images(first: 10) {
              nodes {
                url
                altText
              }
            }

            variants(first: 50) {
              nodes {
                id
                title
                sku
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }

            collections(first: 10) {
              nodes {
                id
                title
                handle
              }
            }
          }
        }
      }
    `;

    const data = await shopifyRequest(query, {
      first: first
    });

    const nodes =
      data &&
      data.products &&
      data.products.nodes
        ? data.products.nodes
        : [];

    return nodes
      .map(convertShopifyProduct)
      .filter(Boolean);
  }


  /* =========================================================
     GET SINGLE SHOPIFY PRODUCT
     ========================================================= */

  async function getShopifyProductByHandle(handle) {
    if (!handle) return null;

    const query = `
      query GetProduct($handle: String!) {
        product(handle: $handle) {
          id
          handle
          title
          description
          descriptionHtml
          productType

          images(first: 10) {
            nodes {
              url
              altText
            }
          }

          variants(first: 50) {
            nodes {
              id
              title
              sku
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }

          collections(first: 10) {
            nodes {
              id
              title
              handle
            }
          }
        }
      }
    `;

    const data = await shopifyRequest(query, {
      handle: String(handle)
    });

    if (!data || !data.product) {
      return null;
    }

    return convertShopifyProduct(data.product);
  }


  /* =========================================================
     SEARCH SHOPIFY PRODUCTS
     ========================================================= */

  async function searchProducts(queryText) {
    const products = await fetchShopifyProducts({
      first: 50
    });

    if (!queryText) {
      return products;
    }

    const searchTerm = String(queryText)
      .trim()
      .toLowerCase();

    if (!searchTerm) {
      return products;
    }

    return products.filter(function (product) {
      const searchableText = [
        product.name,
        product.category,
        product.description,
        product.badge,
        product.sku,
        product.handle
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }


  /* =========================================================
     CATEGORY FILTER
     ========================================================= */

  async function getProductsByCategory(category) {
    const products = await fetchShopifyProducts({
      first: 50
    });

    if (!category) {
      return products;
    }

    const normalizedCategory = String(category)
      .trim()
      .toLowerCase();

    return products.filter(function (product) {
      return (
        String(product.category)
          .trim()
          .toLowerCase() === normalizedCategory
      );
    });
  }


  /* =========================================================
     RELATED PRODUCTS
     ========================================================= */

  async function getRelatedProducts(productId, limit) {
    const maxItems =
      Number(limit) > 0
        ? Number(limit)
        : 4;

    const products = await fetchShopifyProducts({
      first: 50
    });

    const currentProduct = products.find(function (product) {
      return (
        product.id === productId ||
        product.handle === productId
      );
    });

    if (!currentProduct) {
      return products.slice(0, maxItems);
    }

    const sameCategory = products.filter(function (product) {
      return (
        product.id !== currentProduct.id &&
        product.category === currentProduct.category
      );
    });

    const otherProducts = products.filter(function (product) {
      return (
        product.id !== currentProduct.id &&
        product.category !== currentProduct.category
      );
    });

    return sameCategory
      .concat(otherProducts)
      .slice(0, maxItems);
  }


  /* =========================================================
     FORMAT PRICE
     ========================================================= */

  function formatPrice(price, currency) {
    const numericPrice = Number(price) || 0;

    const code = currency || "PKR";

    if (code === "PKR") {
      return (
        "PKR " +
        numericPrice.toLocaleString("en-PK")
      );
    }

    return (
      code +
      " " +
      numericPrice.toLocaleString("en-US")
    );
  }


  /* =========================================================
     GET PRODUCT
     ========================================================= */

  async function getProduct(productId) {
    if (!productId) return null;

    /*
      If productId is a Shopify handle
    */
    if (
      typeof productId === "string" &&
      !productId.startsWith("gid://")
    ) {
      return await getShopifyProductByHandle(productId);
    }

    const products = await fetchShopifyProducts({
      first: 50
    });

    return (
      products.find(function (product) {
        return product.id === productId;
      }) || null
    );
  }


  /* =========================================================
     PUBLIC SHOPORA API
     ========================================================= */

  window.ShoporaProducts = {

    shopifyDomain: SHOPIFY_DOMAIN,

    shopifyEndpoint: SHOPIFY_ENDPOINT,

    getAllProducts: fetchShopifyProducts,

    getProduct: getProduct,

    getProductsByCategory:
      getProductsByCategory,

    searchProducts: searchProducts,

    getRelatedProducts:
      getRelatedProducts,

    formatPrice: formatPrice,

    convertShopifyProduct:
      convertShopifyProduct,

    shopifyRequest:
      shopifyRequest
  };


  /* =========================================================
     OPTIONAL GLOBAL READY EVENT
     ========================================================= */

  window.ShoporaProductsReady = true;

  window.dispatchEvent(
    new CustomEvent("shopora:products-ready")
  );

})();
