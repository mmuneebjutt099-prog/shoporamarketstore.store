import {
  Client
} from "@modelcontextprotocol/sdk/client/index.js";

import {
  StreamableHTTPClientTransport
} from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const DSERS_MCP_URL = "https://ai.dsers.com/mcp";

let client = null;
let transport = null;

export function getDsersConfig() {
  return {
    mcpUrl: DSERS_MCP_URL
  };
}

async function connectToDsers() {
  if (client) {
    return client;
  }

  client = new Client({
    name: "shopora-agent",
    version: "1.0.0"
  });

  transport = new StreamableHTTPClientTransport(
    new URL(DSERS_MCP_URL)
  );

  try {
    await client.connect(transport);

    console.log("Connected to DSers MCP.");

    return client;
  } catch (error) {
    client = null;
    transport = null;

    throw new Error(
      `Could not connect to DSers MCP: ${error.message}`
    );
  }
}

export async function listDsersTools() {
  const dsers = await connectToDsers();

  const result = await dsers.listTools();

  return result.tools || [];
}

export async function callDsersTool(
  toolName,
  argumentsObject = {}
) {
  const dsers = await connectToDsers();

  return await dsers.callTool({
    name: toolName,
    arguments: argumentsObject
  });
}

export async function findFashionProducts(
  country,
  amount
) {
  if (!country) {
    throw new Error("Country is required.");
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(
      "Product amount must be a positive number."
    );
  }

  console.log(
    `Preparing DSers product search for ${amount} product(s) shipping to ${country}...`
  );

  const tools = await listDsersTools();

  const searchTool = tools.find(
    tool => tool.name === "search_supplier_products"
  );

  if (!searchTool) {
    throw new Error(
      "DSers search_supplier_products tool is not available."
    );
  }

  console.log(
    "DSers MCP connected. Supplier search tool found."
  );

  /*
   * Actual product search will be added after
   * the OAuth connection is confirmed.
   */

  return [];
}
