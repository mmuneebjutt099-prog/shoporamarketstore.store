import { findFashionProducts } from "./dsers.js";
import { validateProduct } from "./product-validator.js";
import { cleanProductTitle } from "./title-cleaner.js";

export async function getProductsForCountry(country, amount) {
  if (!country) {
    throw new Error("Country is required.");
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Product amount must be a positive number.");
  }

  const products = await findFashionProducts(
    country,
    amount
  );

  if (!Array.isArray(products)) {
    throw new Error(
      "DSers returned an invalid product list."
    );
  }

  const validProducts = [];

  for (const product of products) {
    const validation = validateProduct(
      product,
      country
    );

    if (!validation.valid) {
      console.log(
        `Skipping product: ${
          product?.title || "Unknown product"
        }`
      );

      for (const error of validation.errors) {
        console.log(`  - ${error}`);
      }

      continue;
    }

    const cleanedTitle = cleanProductTitle(
      product.title
    );

    if (!cleanedTitle) {
      console.log(
        "Skipping product: cleaned title is empty."
      );
      continue;
    }

    const cleanedProduct = {
      ...product,
      title: cleanedTitle
    };

    validProducts.push(cleanedProduct);

    if (validProducts.length >= amount) {
      break;
    }
  }

  return validProducts;
}
