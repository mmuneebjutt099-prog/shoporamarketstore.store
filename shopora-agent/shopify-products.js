import { shopifyRequest } from "./shopify.js";

export async function createShopifyProduct(product) {
  const mutation = `
    mutation ProductCreate($product: ProductCreateInput!) {
      productCreate(product: $product) {
        product {
          id
          title
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    product: {
      title: product.title,
      descriptionHtml: product.description || "",
      status: "ACTIVE"
    }
  };

  const data = await shopifyRequest(mutation, variables);

  const result = data.productCreate;

  if (result.userErrors && result.userErrors.length > 0) {
    throw new Error(
      `Shopify product error: ${JSON.stringify(result.userErrors)}`
    );
  }

  if (!result.product) {
    throw new Error("Shopify did not return a created product.");
  }

  return result.product;
}
