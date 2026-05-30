import { createServer, type Server } from "node:http";
import { UnauthorizedError } from "@modelcontextprotocol/sdk/client/auth.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { type McpOAuthConfig, McpOAuthProvider } from "./oauth-provider";
import { app } from "./app";
import { createProvider, getProvider } from "./utils/provider.utils";
import { checkPlatformSupport, checkRoot } from "./utils/sudo.utils";

const CALLBACK_PORT = 3000;

async function startCallbackServer() {
  const server = createServer(app);
  server.listen(CALLBACK_PORT, () => {
    console.log(
      `[OAuth] Callback server listening on http://localhost:${CALLBACK_PORT}`,
    );
  });

  return server;
}

async function connectWithAuth(
  mcpServerUrl: string,
  provider: McpOAuthProvider,
): Promise<Client> {
  const url = new URL(mcpServerUrl);
  const transport = new StreamableHTTPClientTransport(url, {
    authProvider: provider,
  });

  const client = new Client(
    { name: "Codex", version: "1.0.0" },
    { capabilities: {} },
  );

  try {
    await client.connect(transport);
    console.log("[MCP] Connected successfully.");
    return client;
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      // The provider's redirectToAuthorization was already called.
      // Wait for the user to complete the browser flow.
      console.log("[OAuth] Waiting for authorization code via browser...");
      const code = await provider.waitForAuthorizationCode();

      console.log("[OAuth] Authorization code received. Finishing auth...");
      await transport.finishAuth(code);

      // Transport and client can only be started once; create fresh instances.
      console.log("[MCP] Retrying connection after authentication...");
      const retryTransport = new StreamableHTTPClientTransport(url, {
        authProvider: provider,
      });
      const retryClient = new Client(
        { name: "Codex", version: "1.0.0" },
        { capabilities: {} },
      );
      await retryClient.connect(retryTransport);
      console.log("[MCP] Connected successfully.");
      return retryClient;
    }
    throw err;
  }
}

async function main() {
  checkPlatformSupport();
  // check if running as admin/root and exit with an error, to auto update opencode mcp-auth.json and add new auth data
  checkRoot();

  const mcpServerUrl = process.argv[2];
  if (!mcpServerUrl) {
    console.error("Usage: ts-node src/index.ts <mcp-server-url>");
    console.error("  Example: ts-node src/index.ts https://example.com/mcp");
    process.exit(1);
  }

  const provider = await getProvider(mcpServerUrl, CALLBACK_PORT);

  // Start the local HTTP server to receive the OAuth callback
  const callbackServer = await startCallbackServer();

  let client: Client | undefined;
  try {
    client = await connectWithAuth(mcpServerUrl, provider);

    // List available tools as a smoke-test
    console.log("\n[MCP] Listing available tools...");
    const tools = await client.listTools();
    if (tools.tools.length === 0) {
      console.log("[MCP] No tools available on this server.");
    } else {
      console.log("[MCP] Available tools:");
      for (const tool of tools.tools) {
        console.log(
          `  - ${tool.name}: ${tool.description ?? "(no description)"}`,
        );
      }
    }
  } finally {
    if (client) {
      await client.close();
      console.log("[MCP] Connection closed.");
    }
    callbackServer.close(() => {
      console.log("[OAuth] Callback server stopped.");
    });
  }
}

main().catch((err) => {
  console.error("[Error]", err);
  process.exit(1);
});
