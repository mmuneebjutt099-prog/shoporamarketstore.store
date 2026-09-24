import { parseCountryRequests, DEFAULT_COUNTRY } from "./config.js";
import { getProductsForCountry } from "./product-importer.js";

function printUsage() {
  console.log(`
Shopora Agent

Usage:

  node agent.js add-products
  node agent.js add-products 1
  node agent.js add-products 10 Pakistan
  node agent.js add-products 5 Pakistan 5 USA
`);
}

async function main() {
  const command = process.argv[2];

  if (!command) {
    printUsage();
    return;
  }

  if (command !== "add-products") {
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  try {
    const requests = parseCountryRequests(
      process.argv.slice(3)
    );

    console.log("Shopora Agent starting...");
    console.log("");

    for (const request of requests) {
      const country = request.country || DEFAULT_COUNTRY;

      console.log(
        `Request: ${request.amount} product(s) for ${country}`
      );

      const products = await getProductsForCountry(
        country,
        request.amount
      );

      if (products.length === 0) {
        console.log(
          `No valid products found for ${country}.`
        );
        continue;
      }

      console.log(
        `Found ${products.length} valid product(s).`
      );

      for (const product of products) {
        console.log(`- ${product.title}`);
      }
    }

    console.log("");
    console.log("Shopora Agent finished.");
  } catch (error) {
    console.error("");
    console.error("Shopora Agent Error:");
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();
