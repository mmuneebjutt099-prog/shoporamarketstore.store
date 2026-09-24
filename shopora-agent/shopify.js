const SHOPIFY_API_VERSION = "2026-07";

function getShopifyCredentials() {
  const store = process.env.SHOPIFY_STORE;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!store) {
    throw new Error(
      "SHOPIFY_STORE is missing from the environment."
    );
  }

  if (!token) {
    throw new Error(
      "SHOPIFY_ADMIN_ACCESS_TOKEN is missing from the environment."
    );
  }

  return {
    store,
    token
  };
}

export async function shopifyRequest(
  query,
  variables = {}
) {
  if (!query || typeof query !== "string") {
    throw new Error(
      "Shopify GraphQL query is required."
    );
  }

  const { store, token } =
    getShopifyCredentials();

  const endpoint =
    `https://${store}/admin/api/` +
    `${SHOPIFY_API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token
    },

    body: JSON.stringify({
      query,
      variables
    })
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Shopify returned an invalid JSON response. ` +
      `HTTP ${response.status}.`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Shopify HTTP ${response.status}: ` +
      `${JSON.stringify(data)}`
    );
  }

  if (data.errors?.length) {
    throw new Error(
      `Shopify GraphQL error: ` +
      `${JSON.stringify(data.errors)}`
    );
  }

  if (!data.data) {
    throw new Error(
      "Shopify returned no GraphQL data."
    );
  }

  return data.data;
}

export function getShopifyApiVersion() {
  return SHOPIFY_API_VERSION;
}
