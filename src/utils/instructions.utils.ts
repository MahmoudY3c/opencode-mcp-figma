import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import fs from "fs";
import path from "path";

export async function saveToolInstructions(
  client: Client,
  serverUrl: string,
): Promise<string> {
  const vendor = getVendorName(serverUrl);
  const tools = await client.listTools();
  let instructions = "";
  const folderPath = path.join(process.cwd(), "vendor_instructions");

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  if (tools.tools.length) {
    instructions = `# ${serverUrl} - Available Tools\n`;
    for (const tool of tools.tools) {
      instructions += `## ${tool.name}\n`;
      instructions += `${tool.description || "(no description)"}\n`;
    }
  }

  const outputPath = path.join(
    folderPath,
    `${vendor}_instructions.md`,
  );

  if (instructions) {
    fs.writeFileSync(outputPath, instructions, "utf-8");
    console.log(`\n[MCP] Tool instructions saved to: ${outputPath}`);
    console.log(
      "[MCP] This file provides context for agents working with this MCP server.",
    );
  }

  return outputPath;
}

export const getVendorName = (url: string | URL): string => {
  const host = url instanceof URL ? url.hostname : new URL(url).hostname;
  const parts = host.split(".").filter(Boolean);
  if (parts.length === 0) return "unknown";
  if (parts.length === 1) return parts[0];
  return parts[parts.length - 2]; // Get the second-to-last part as vendor name
};
