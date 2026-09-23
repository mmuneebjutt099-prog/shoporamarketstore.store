console.log("Shopora Agent starting...");

const command = process.argv[2];
const amount = Number(process.argv[3] || 1);

if (command === "add-products") {
  console.log(`Requested products: ${amount}`);
  console.log("Shopora Agent is ready.");
} else {
  console.log(`
Shopora Agent

Usage:

node agent.js add-products 1
node agent.js add-products 10
node agent.js add-products 50
`);
}
