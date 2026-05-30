import express from "express";
import { getProviderPromise } from "./utils/provider.utils";

export const app = express();

app.get('/callback', async (req, res) => {
  const code = req.query.code as string | undefined;
  const error = req.query.error as string | undefined;
  const provider = await getProviderPromise ; // Assume this function retrieves the OAuth provider instance

  if (error) {
    res.status(400).send(`<h1>Authorization failed</h1><p>${error}</p>`);
    console.error(`[OAuth] Authorization error: ${error}`);
    return;
  }

  if (!code) {
    res.status(400).send("<h1>Missing authorization code</h1>");
    return;
  }

  res.send(
    "<h1>Authorization successful!</h1><p>You can close this tab and return to the terminal.</p>",
  );

  provider.receiveAuthorizationCode(code);
});
