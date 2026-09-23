const SHOPIFY_API_VERSION = "2026-07";

export async function shopifyRequest(query, variables = {}) {
  const store = process.env.SHOPIFY_STORE;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!store) {
    throw new Error("SHOPIFY_STORE is missing.");
  }

  if (!token) {
    throw new Error("SHOPIFY_ADMIN_ACCESS_TOKEN is missing.");
  }

  const response = await fetch(
    `https://${store}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token
      },
      body: JSON.stringify({
        query,
        variables
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Shopify HTTP ${response.status}: ${JSON.stringify(data)}`
    );
  }

  if (data.errors) {
    throw new Error(
      `Shopify GraphQL error: ${JSON.stringify(data.errors)}`
    );
  }

  return data.data;
}
