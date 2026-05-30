#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");

const SOURCE_FILE = path.resolve(process.cwd(), "mcp-auth.json");

if (!fs.existsSync(SOURCE_FILE)) {
  console.error(
    "Error: mcp-auth.json not found in project root. Run 'npm run dev' first.",
  );
  process.exit(1);
}

function getDestDir() {
  const platform = os.platform();
  if (platform === "win32") {
    const appData = process.env.APPDATA;
    if (!appData) {
      console.error("Error: APPDATA environment variable is not set.");
      process.exit(1);
    }
    return path.join(appData, "opencode");
  }
  return path.join(os.homedir(), ".local", "share", "opencode");
}

function getDestPath() {
  return path.join(getDestDir(), "mcp-auth.json");
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return true;
  }
  return false;
}

function isWritable(dir) {
  try {
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

async function requestElevation(platform) {
  if (platform === "win32") {
    console.log(
      "\nMake sure the destination directory is writable, or re-run this script as Administrator.",
    );
  } else {
    const { execSync } = require("child_process");
    try {
      execSync("which sudo", { stdio: "ignore" });
      console.log("\nElevated privileges required. Re-running with sudo...");
      const args = process.argv.map((a) => (a.includes(" ") ? `"${a}"` : a));
      execSync(`sudo "${process.execPath}" ${args.slice(2).join(" ")}`, {
        stdio: "inherit",
      });
      return true;
    } catch {
      console.log(
        "\nPermission denied. Try running with:",
      );
      console.log(`  sudo ${process.argv.slice(1).join(" ")}`);
    }
  }
  return false;
}

function main() {
  const destPath = getDestPath();
  const destDir = path.dirname(destPath);
  const platform = os.platform();

  console.log(`Platform : ${platform}`);
  console.log(`Source   : ${SOURCE_FILE}`);
  console.log(`Target   : ${destPath}`);
  console.log("");

  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(
      "mcp-auth.json not found in project root. Run 'npm run dev' first.",
    );
    process.exit(1);
  }

  const created = ensureDir(destDir);
  if (created) {
    console.log(`Created directory: ${destDir}`);
  }

  if (!isWritable(destDir)) {
    requestElevation(platform);
    process.exit(1);
  }

  const sourceData = JSON.parse(fs.readFileSync(SOURCE_FILE, "utf-8"));

  if (fs.existsSync(destPath)) {
    const destData = JSON.parse(fs.readFileSync(destPath, "utf-8"));
    const merged = deepMerge(destData, sourceData);
    fs.writeFileSync(destPath, JSON.stringify(merged, null, 2) + "\n", "utf-8");
    console.log("Merged credentials into existing file.");
  } else {
    fs.writeFileSync(destPath, JSON.stringify(sourceData, null, 2) + "\n", "utf-8");
    console.log("Copied credentials (no existing file found).");
  }

  console.log(`Done → ${destPath}`);
}

main();
