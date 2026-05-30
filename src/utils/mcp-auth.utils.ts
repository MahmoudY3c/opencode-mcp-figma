import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const AUTH_FILE = join(process.cwd(), "mcp-auth.json");

/** Shape as stored in mcp-auth.json (camelCase, matching the file format). */
export interface StoredClientInfo {
  clientId?: string;
  clientSecret?: string;
  clientIdIssuedAt?: number;
  clientSecretExpiresAt?: number;
}

/** Tokens as stored in mcp-auth.json (camelCase keys, expiresAt as absolute timestamp). */
export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  /** Absolute Unix timestamp (seconds) when the access token expires. */
  expiresAt?: number;
}

export interface ServerAuthEntry {
  clientInfo?: StoredClientInfo;
  serverUrl?: string;
  tokens?: StoredTokens;
}

export interface ServerStateEntry {
  oauthState?: string;
  codeVerifier?: string;
}

type AuthFileContents = Record<string, ServerAuthEntry | ServerStateEntry>;

export function readFile(): AuthFileContents {
  if (!existsSync(AUTH_FILE)) return {};
  try {
    return JSON.parse(readFileSync(AUTH_FILE, "utf-8")) as AuthFileContents;
  } catch {
    return {};
  }
}

export function writeFile(contents: AuthFileContents): void {
  writeFileSync(AUTH_FILE, `${JSON.stringify(contents, null, 2)}\n`, "utf-8");
}

/**
 * Derives a stable lowercase key from a server URL hostname.
 * e.g. "https://mcp.figma.com/mcp" -> "figma"
 */
export function serverKey(serverUrl: string): string {
  try {
    const host = new URL(serverUrl).hostname; // e.g. "mcp.figma.com"
    const parts = host.replace(/^www\./, "").split(".");
    // Second-to-last part is the SLD, e.g. "figma" from "mcp.figma.com"
    return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  } catch {
    return serverUrl;
  }
}

/**
 * Title-case version of the key, used for the state entry in mcp-auth.json.
 */
export function stateKey(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}
