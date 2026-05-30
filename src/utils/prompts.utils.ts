import prompts from "prompts";
import semver from "semver";

export const askMcpServerUrl = async (): Promise<string> => {
  const result = await prompts({
    type: "text",
    name: "url",
    message: "Enter the MCP server URL: ",
    initial: "https://mcp.figma.com/mcp",
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return "Please enter a valid URL.";
      }
    },
  });

  return result.url as string;
};

export const askClientInfo = async () => {
  const result = await prompts([
    {
      type: "text",
      name: "mcpClientName",
      message: "Enter the MCP Client Name: ",
      initial: "Codex",
      validate: (value) => {
        if (!value.trim()) {
          return "Client name cannot be empty.";
        }

        return true;
      },
    },
    {
      type: "text",
      name: "mcpClientVersion",
      message: "Enter the MCP Client Version: ",
      initial: "1.0.0",
      validate: (value) => {
        if (!value.trim()) {
          return "Client version cannot be empty.";
        }

        if (!semver.valid(value.trim())) {
          return "Please enter a valid semantic version.";
        }

        return true;
      },
    },
  ]);

  return {
    mcpClientName: result.mcpClientName as string,
    mcpClientVersion: (result.mcpClientVersion as string) || "1.0.0",
  };
};
