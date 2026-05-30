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
  const folderPath = path.join(process.cwd(), "vendor_tools");
  const skillsFolderPath = path.join(process.cwd(), "skills");

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  if (!fs.existsSync(skillsFolderPath)) {
    fs.mkdirSync(skillsFolderPath, { recursive: true });
  }

  if (tools.tools.length) {
    instructions = `# ${serverUrl} - Available Tools\n`;
    for (const tool of tools.tools) {
      instructions += `## ${tool.name}\n`;
      instructions += `${tool.description || "(no description)"}\n`;
    }
  }

  const outputPath = path.join(folderPath, `${vendor}_tools.md`);
  const skillOutputFolderPath = path.join(skillsFolderPath, `${vendor}-tools`);
  const skillOutputPath = path.join(skillOutputFolderPath, `SKILL.md`);

  if (instructions) {
    fs.writeFileSync(outputPath, instructions, "utf-8");

    if (!fs.existsSync(skillOutputFolderPath)) {
      fs.mkdirSync(skillOutputFolderPath, { recursive: true });
    }

    // Create a SKILL.md file in the skills folder with the same instructions
    fs.writeFileSync(
      skillOutputPath,
      `---\nname: ${vendor}-tools\ndescription: Use when working with ${vendor} MCP tools including ${tools.tools.map((t) => t.name).join(", ")} \n---\n\n${instructions}`,
      "utf-8",
    );

    console.log(`\n[MCP] Tool instructions saved to: ${outputPath}`);
    console.log(`[MCP] SKILL file created at: ${skillOutputPath}`);

    console.log(`\n[MCP] Recommended next steps:`);
    console.log(
      `  To use as an OpenCode skill, symlink into your config:`,
    );
    console.log(
      `    ln -sf "$(pwd)/skills/${vendor}-tools" ~/.config/opencode/skills/${vendor}-tools`,
    );
    console.log(
      `  Or copy it:`,
    );
    console.log(
      `    cp -r skills/${vendor}-tools ~/.config/opencode/skills/${vendor}-tools`,
    );
    console.log(
      `  OpenCode will auto-load the skill when the task description matches.`,
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
