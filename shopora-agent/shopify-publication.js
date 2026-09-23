import { shopifyRequest } from "./shopify.js";

export async function getPublications() {
  const query = `
    query GetPublications {
      publications(first: 50) {
        nodes {
          id
          name
        }
      }
    }
  `;

  const data = await shopifyRequest(query);

  return data.publications.nodes;
}

export async function publishProductToPublication(
  productId,
  publicationId
) {
  const mutation = `
    mutation PublishProduct(
      $id: ID!,
      $input: [PublicationInput!]!
    ) {
      publishablePublish(
        id: $id,
        input: $input
      ) {
        publishable {
          ... on Product {
            id
            title
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    id: productId,
    input: [
      {
        publicationId
      }
    ]
  };

  const data = await shopifyRequest(
    mutation,
    variables
  );

  const result = data.publishablePublish;

  if (result.userErrors && result.userErrors.length > 0) {
    throw new Error(
      `Publication error: ${JSON.stringify(result.userErrors)}`
    );
  }

  return result.publishable;
}
