import readline from "readline";
export const askMcpServerUrl = (): Promise<string> => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Enter the MCP server URL: ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};
