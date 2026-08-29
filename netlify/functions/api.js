// Netlify Function wrapper for the Express API.
//
// index.js exports the configured app and only calls app.listen() when run
// directly, so the same file serves both local development and this handler.
//
// The function is mounted at /api/* by the redirect in netlify.toml, which
// puts the API on the same origin as the site. That removes CORS from the
// picture entirely — no CLIENT_URL to keep in sync, no preflight failures.
import serverless from "serverless-http";
import app from "../../Backend/index.js";

export const handler = serverless(app, {
  // Netlify strips the function prefix; Express still expects /api/... paths.
  basePath: "",
});
