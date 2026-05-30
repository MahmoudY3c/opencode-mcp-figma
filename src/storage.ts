import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type {
  OAuthClientInformationMixed,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import {
  readFile,
  ServerAuthEntry,
  serverKey,
  ServerStateEntry,
  stateKey,
  StoredTokens,
  writeFile,
} from "./utils/mcp-auth.utils";

export class AuthStorage {
  private readonly key: string;
  private readonly sKey: string;
  private readonly serverUrl: string;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
    this.key = serverKey(serverUrl);
    this.sKey = stateKey(this.key);
  }

  loadClientInformation(): OAuthClientInformationMixed | undefined {
    const data = readFile();
    const info = (data[this.key] as ServerAuthEntry | undefined)?.clientInfo;
    if (!info?.clientId) return undefined;
    return {
      client_id: info.clientId,
      ...(info.clientSecret !== undefined && {
        client_secret: info.clientSecret,
      }),
      ...(info.clientIdIssuedAt !== undefined && {
        client_id_issued_at: info.clientIdIssuedAt,
      }),
      ...(info.clientSecretExpiresAt !== undefined && {
        client_secret_expires_at: info.clientSecretExpiresAt,
      }),
    };
  }

  saveClientInformation(info: OAuthClientInformationMixed): void {
    const data = readFile();
    const entry = (data[this.key] as ServerAuthEntry) ?? {};
    entry.serverUrl = this.serverUrl;
    entry.clientInfo = {
      clientId: info.client_id,
      ...("client_secret" in info &&
        info.client_secret !== undefined && {
          clientSecret: info.client_secret,
        }),
      ...("client_id_issued_at" in info &&
        info.client_id_issued_at !== undefined && {
          clientIdIssuedAt: info.client_id_issued_at,
        }),
      ...("client_secret_expires_at" in info &&
        info.client_secret_expires_at !== undefined && {
          clientSecretExpiresAt: info.client_secret_expires_at,
        }),
    };
    data[this.key] = entry;
    writeFile(data);
  }

  loadTokens(): OAuthTokens | undefined {
    const data = readFile();
    const stored = (data[this.key] as ServerAuthEntry | undefined)?.tokens;
    if (!stored) return undefined;
    const now = Date.now() / 1000;
    return {
      access_token: stored.accessToken,
      token_type: "bearer",
      ...(stored.refreshToken !== undefined && {
        refresh_token: stored.refreshToken,
      }),
      ...(stored.expiresAt !== undefined && {
        expires_in: Math.max(0, Math.round(stored.expiresAt - now)),
      }),
    };
  }

  saveTokens(tokens: OAuthTokens): void {
    const data = readFile();
    const entry = (data[this.key] as ServerAuthEntry) ?? {};
    entry.serverUrl = this.serverUrl;
    const now = Date.now() / 1000;
    const stored: StoredTokens = {
      accessToken: tokens.access_token,
      ...(tokens.refresh_token !== undefined && {
        refreshToken: tokens.refresh_token,
      }),
      ...(tokens.expires_in !== undefined && {
        expiresAt: now + tokens.expires_in,
      }),
    };
    entry.tokens = stored;
    data[this.key] = entry;
    writeFile(data);
  }

  loadCodeVerifier(): string | undefined {
    const data = readFile();
    return (data[this.sKey] as ServerStateEntry | undefined)?.codeVerifier;
  }

  saveCodeVerifier(codeVerifier: string): void {
    const data = readFile();
    const entry = (data[this.sKey] as ServerStateEntry) ?? {};
    entry.codeVerifier = codeVerifier;
    data[this.sKey] = entry;
    writeFile(data);
  }

  loadOAuthState(): string | undefined {
    const data = readFile();
    return (data[this.sKey] as ServerStateEntry | undefined)?.oauthState;
  }

  saveOAuthState(state: string): void {
    const data = readFile();
    const entry = (data[this.sKey] as ServerStateEntry) ?? {};
    entry.oauthState = state;
    data[this.sKey] = entry;
    writeFile(data);
  }
}
