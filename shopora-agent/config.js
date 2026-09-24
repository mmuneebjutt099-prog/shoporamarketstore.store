export const DEFAULT_COUNTRY = "Pakistan";

export const SUPPORTED_COUNTRIES = [
  "Pakistan",
  "USA",
  "UK",
  "Canada",
  "Australia",
  "UAE",
  "Saudi Arabia",
  "Germany",
  "France",
  "Italy",
  "Spain"
];

export function normalizeCountry(country) {
  const value = String(country || "").trim().toLowerCase();

  const aliases = {
    pk: "Pakistan",
    pakistan: "Pakistan",

    us: "USA",
    usa: "USA",
    "united states": "USA",
    "united states of america": "USA",

    uk: "UK",
    "united kingdom": "UK",
    gb: "UK",

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

export function isSupportedCountry(country) {
  const normalized = normalizeCountry(country);

  return SUPPORTED_COUNTRIES.includes(normalized);
}

export function parseCountryRequests(args) {
  if (!args || args.length === 0) {
    return [
      {
        country: DEFAULT_COUNTRY,
        amount: 1
      }
    ];
  }

  if (args.length % 2 !== 0) {
    throw new Error(
      "Each product amount must be followed by a country."
    );
  }

  const requests = [];

  for (let i = 0; i < args.length; i += 2) {
    const amount = Number(args[i]);
    const country = normalizeCountry(args[i + 1]);

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error(
        `Invalid product amount: "${args[i]}".`
      );
    }

    if (!isSupportedCountry(country)) {
      throw new Error(
        `Unsupported country: "${args[i + 1]}". Supported countries: ${SUPPORTED_COUNTRIES.join(", ")}`
      );
    }

    requests.push({
      country,
      amount
    });
  }

  return requests;
}
