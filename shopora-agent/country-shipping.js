export function normalizeCountry(country) {
  const value = String(country || "")
    .trim()
    .toLowerCase();

  const aliases = {
    pk: "Pakistan",
    pakistan: "Pakistan",

    us: "USA",
    usa: "USA",
    "united states": "USA",
    "united states of america": "USA",

    uk: "UK",
    gb: "UK",
    "united kingdom": "UK",

    ca: "Canada",
    canada: "Canada",

    au: "Australia",
    australia: "Australia",

    ae: "UAE",
    uae: "UAE",
    "united arab emirates": "UAE",

    sa: "Saudi Arabia",
    "saudi arabia": "Saudi Arabia",

    de: "Germany",
    germany: "Germany",

    fr: "France",
    france: "France",

    it: "Italy",
    italy: "Italy",

    es: "Spain",
    spain: "Spain"
  };

  return aliases[value] || String(country || "").trim();
}

function containsCountry(value, country) {
  if (value === null || value === undefined) {
    return false;
  }

  const text = String(value).toLowerCase();
  const normalizedCountry = normalizeCountry(country)
    .toLowerCase();

  return (
    text.includes(normalizedCountry) ||
    (normalizedCountry === "usa" &&
      (text.includes("united states") ||
        text.includes("u.s.a.") ||
        text.includes("us"))) ||
    (normalizedCountry === "uk" &&
      text.includes("united kingdom"))
  );
}

export function shippingMatchesCountry(
  shipping,
  requestedCountry
) {
  if (!shipping || !requestedCountry) {
    return false;
  }

  const country = normalizeCountry(requestedCountry);

  if (typeof shipping === "string") {
    return containsCountry(shipping, country);
  }

  if (Array.isArray(shipping)) {
    return shipping.some(item =>
      shippingMatchesCountry(item, country)
    );
  }

  if (typeof shipping === "object") {
    for (const [key, value] of Object.entries(shipping)) {
      if (containsCountry(key, country)) {
        return true;
      }

      if (shippingMatchesCountry(value, country)) {
        return true;
      }
    }
  }

  return false;
}

export function productShipsToCountry(product, country) {
  if (!product || !country) {
    return false;
  }

  const shipping =
    product.shipping ??
    product.logistics ??
    product.delivery ??
    product.shippingOptions ??
    product.shippingMethods;

  return shippingMatchesCountry(
    shipping,
    country
  );
}
