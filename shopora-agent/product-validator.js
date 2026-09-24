import { isFashionProduct } from "./product-rules.js";
import { productShipsToCountry } from "./country-shipping.js";

export function validateProduct(product, country) {
  const errors = [];

  if (!product || typeof product !== "object") {
    return {
      valid: false,
      errors: ["Product data is missing or invalid."]
    };
  }

  if (!isFashionProduct(product)) {
    errors.push(
      "Product is not a supported fashion product."
    );
  }

  const title = String(product.title || "").trim();

  if (!title) {
    errors.push("Product title is missing.");
  }

  const images = Array.isArray(product.images)
    ? product.images
    : [];

  if (images.length === 0) {
    errors.push("Product has no images.");
  }

  const stockValue =
    product.stock ??
    product.inventory_quantity ??
    product.inventoryQuantity;

  const stock = Number(stockValue);

  if (!Number.isFinite(stock) || stock < 1) {
    errors.push("Product has no available stock.");
  }

  const variants = Array.isArray(product.variants)
    ? product.variants
    : [];

  if (variants.length === 0) {
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
