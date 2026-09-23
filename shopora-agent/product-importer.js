import { findFashionProducts } from "./dsers.js";
import { validateProduct } from "./product-validator.js";
import { cleanProductTitle } from "./title-cleaner.js";

export async function getProductsForCountry(country, amount) {
  const products = await findFashionProducts(country, amount);

  const validProducts = [];

  for (const product of products) {
    const validation = validateProduct(product, country);

    if (!validation.valid) {
      console.log(
        `Skipping product: ${product.title || "Unknown product"}`
      );

      for (const error of validation.errors) {
        console.log(`  - ${error}`);
      }

      continue;
    }

    const cleanedProduct = {
      ...product,
      title: cleanProductTitle(product.title)
    };

    validProducts.push(cleanedProduct);

    if (validProducts.length >= amount) {
      break;
    }
  }

  return validProducts;
}
