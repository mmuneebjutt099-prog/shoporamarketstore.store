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

export function parseCountryRequests(args) {
  if (args.length === 0) {
    return [{ country: DEFAULT_COUNTRY, amount: 1 }];
  }

  const requests = [];

  for (let i = 0; i < args.length; i += 2) {
    const amount = Number(args[i]);
    const country = args[i + 1];

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error(
        `Invalid product amount: "${args[i]}"`
      );
    }

    if (!country) {
      throw new Error(
        `Country missing after amount "${amount}".`
      );
    }

    requests.push({
      country,
      amount
    });
  }

  return requests;
}
