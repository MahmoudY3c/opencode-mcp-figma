# Log into figma MCP

## What is it for?

Figma MCP rejects non-whitelisted agents, including OpenCode.
This almost no-dependncy code allows to authenticate and create the mcp-auth.json file.

## Authenticating

```bash
npm i
npm run build
npm start https://mcp.figma.com/mcp
```

## Add to MCP

Then move or merge mcp-auth.json into ~/.local/share/opencode/mcp-auth.json

## Other MCPs?

This was only tested with Figma.
