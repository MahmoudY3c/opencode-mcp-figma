export const checkPlatformSupport = (): void => {
  const supportedPlatforms = ["darwin", "linux"];
  if (!supportedPlatforms.includes(process.platform)) {
    console.error(
      `Unsupported platform: ${process.platform}. This tool only works on macOS and Linux.`,
    );
    process.exit(1);
  }
};

export const checkNodeVersion = (): void => {
  const majorVersion = parseInt(process.versions.node.split(".")[0], 10);
  if (majorVersion < 18) {
    console.error(
      `Unsupported Node.js version: ${process.versions.node}. Please use Node.js 18 or higher.`,
    );
    process.exit(1);
  }
};

export const checkRoot = (): void => {
  console.log(process.geteuid?.());
  if (process.getuid && process.getuid() === 0) {
    return; // Running as root, which is supported
  }

  console.error(
    "This tool must be run with elevated privileges (e.g. using sudo) to ensure proper permissions for storing ~/.local/share/opencode/mcp-auth.json authentication data. Please run with sudo.",
  );

  process.exit(1);
};
