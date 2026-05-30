import { McpOAuthConfig, McpOAuthProvider } from "../oauth-provider";
import { waitForValue } from "./wait.utils";

let provider: McpOAuthProvider | null = null;

export const getProviderPromise = new Promise<McpOAuthProvider>((resolve) => {
  const checkProvider = () => {
    if (provider) {
      resolve(provider);
    } else {
      setTimeout(checkProvider, 1000);
    }
  };
  checkProvider();
  // console.log(`[OAuth] Waiting for provider to be ready`);
});

export const createProvider = (
  serverUrl: string,
  callbackPort?: number,
): McpOAuthProvider => {
  const config: McpOAuthConfig = {
    serverUrl,
    callbackPort,
  };

  provider = new McpOAuthProvider(config);
  return provider;
};

export const getProvider = async (
  serverUrl?: string,
  callbackPort?: number,
): Promise<McpOAuthProvider> => {
  if (!provider) {
    if (serverUrl) {
      provider = createProvider(serverUrl, callbackPort);
      return provider;
    }

    return await getProviderPromise;

    // throw new Error("OAuth provider not initialized");
  }

  return provider;
};
