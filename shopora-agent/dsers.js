const DSERS_API_BASE = "https://api.dsers.com";

export async function dsersRequest(path, options = {}) {
  const apiKey = process.env.DSERS_API_KEY;

  if (!apiKey) {
    throw new Error("DSERS_API_KEY is missing.");
  }

  const response = await fetch(
    `${DSERS_API_BASE}${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        ...(options.headers || {})
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `DSers HTTP ${response.status}: ${JSON.stringify(data)}`
    );
  }

  return data;
}

export async function findFashionProducts(country, amount) {
  if (!country) {
    throw new Error("Country is required.");
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Product amount must be a positive number.");
  }

  console.log(
    `Searching for ${amount} fashion products shipping to ${country}...`
  );

  // DSers product-search integration will be connected
  // in the next step.
  return [];
}
