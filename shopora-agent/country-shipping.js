export function normalizeCountry(country) {
  const value = String(country || "").trim().toLowerCase();

  const aliases = {
    pk: "Pakistan",
    pakistan: "Pakistan",

    us: "USA",
    usa: "USA",
    "united states": "USA",

    uk: "UK",
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

  return aliases[value] || country;
}

export function shippingMatchesCountry(shipping, requestedCountry) {
  if (!shipping || !requestedCountry) {
    return false;
  }

  const country = normalizeCountry(requestedCountry);

  const shippingText = JSON.stringify(shipping).toLowerCase();

  return shippingText.includes(country.toLowerCase());
}

export function productShipsToCountry(product, country) {
  if (!product || !country) {
    return false;
  }

  const shipping = product.shipping || product.logistics || product.delivery;

  return shippingMatchesCountry(shipping, country);
}
