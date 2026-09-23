import { isFashionProduct } from "./product-rules.js";
import { productShipsToCountry } from "./country-shipping.js";

export function validateProduct(product, country) {
  const errors = [];

  if (!product) {
    return {
      valid: false,
      errors: ["Product data is missing."]
    };
  }

  if (!isFashionProduct(product)) {
    errors.push("Product is not a supported fashion product.");
  }

  if (!product.title || !String(product.title).trim()) {
    errors.push("Product title is missing.");
  }

  if (
    !product.images ||
    !Array.isArray(product.images) ||
    product.images.length === 0
  ) {
    errors.push("Product has no images.");
  }

  if (
    product.stock === undefined ||
    product.stock === null ||
    Number(product.stock) < 1
  ) {
    errors.push("Product has no available stock.");
  }

  if (
    !product.variants ||
    !Array.isArray(product.variants) ||
    product.variants.length === 0
  ) {
    errors.push("Product has no variants.");
  }

  if (!productShipsToCountry(product, country)) {
    errors.push(
      `Product does not have confirmed shipping to ${country}.`
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
