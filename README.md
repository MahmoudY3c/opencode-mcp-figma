# MCP OAuth Authentication

This tool handles OAuth authentication for Model Context Protocol (MCP) servers,  It manages the OAuth flow, handles authorization callbacks, stores credentials securely, and verifies successful connection by listing available tools. and auto-generate agent-ready tool instructions and skills.

## How it works

1. Starts a local HTTP server to receive OAuth callbacks
2. Initiates OAuth flow with the specified MCP server
3. Handles authorization code exchange and token management
4. Saves authentication credentials to `mcp-auth.json`
5. Lists available tools to verify the connection
6. Generates tool instructions and skill files in `vendor_tools/` and `skills/`

## Quick start

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

Authentication state is stored in `mcp-auth.json` at the project root, containing:

- OAuth client information (ID, secret)
- Access and refresh tokens
- Token expiration timestamps

Move or merge this file to `~/.local/share/opencode/mcp-auth.json` for use with OpenCode or other MCP clients.

## Generated outputs

After a successful OAuth flow, the tool generates two types of output:

### `vendor_tools/<vendor>_tools.md`

A markdown file listing every tool exposed by the MCP server with its full description. Useful as a reference when writing prompts or configuring agent context.

### `skills/<vendor>-tools/SKILL.md`

An auto-generated OpenCode skill file that contains the same tool instructions in a format OpenCode can load automatically. The skill includes a frontmatter `name` and `description` that OpenCode uses for automatic skill matching.

To use the generated skill with OpenCode:

1. Copy the skill directory into your OpenCode skills location:

   ```bash
   cp -r skills/figma-tools ~/.config/opencode/skills/figma-tools
   ```

2. OpenCode scans `~/.config/opencode/skills/` (and project-level `.opencode/skills/`) for skills and loads them automatically when the `description` matches the task at hand.

Alternatively, symlink it:

```bash
ln -sf "$(pwd)/skills/figma-tools" ~/.config/opencode/skills/figma-tools
```

## Supported MCP Servers

Tested and working with:

- Figma MCP

Can authenticate with any MCP server that supports OAuth 2.0 authorization code flow.
