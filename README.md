# MCP OAuth Authentication

## What is it for?

This tool handles OAuth authentication for Model Context Protocol (MCP) servers. It manages the OAuth flow, handles authorization callbacks, stores credentials securely, and verifies successful connection by listing available tools.

## How it works

1. Starts a local HTTP server to receive OAuth callbacks
2. Initiates OAuth flow with the specified MCP server
3. Handles authorization code exchange and token management
4. Saves authentication credentials to `mcp-auth.json`
5. Lists available tools to verify the connection

## Getting started

```bash
npm install
npm run dev
```

You'll be prompted to enter:
- **MCP Server URL**: The OAuth endpoint (e.g., `https://mcp.figma.com/mcp`)
- **Client Name**: Optional custom client name (defaults to "Codex")
- **Client Version**: Optional custom client version (defaults to "1.0.0")

## Production build

```bash
npm run build
npm start
```

## Credentials

The tool generates an `mcp-auth.json` file containing:
- OAuth client information (ID, secret)
- Access and refresh tokens
- Token expiration timestamps

Move or merge this file to `~/.local/share/opencode/mcp-auth.json` for use with OpenCode or other MCP clients.

## Vendor Instructions

The `vendor_instructions/` directory contains curated usage guides for each MCP server's tools. These provide agents with detailed patterns (URL parsing, edge cases, tool selection priorities) that aren't available from raw MCP tool schemas. Wire them into opencode via the `instructions` field on the MCP server entry in `opencode.json`:

```json
{
  "mcpServers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp",
      "auth": {
        "type": "oauth"
      },
      "instructions": "vendor_instructions/figma_instructions.md"
    }
  }
}
```

When set, opencode injects the instructions into the agent's system prompt whenever that server is available, significantly improving tool usage correctness.

## Supported MCP Servers

Tested and working with:
- Figma MCP

Can authenticate with any MCP server that supports OAuth 2.0 authorization code flow.
