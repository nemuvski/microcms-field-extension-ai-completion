import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import apiRoute from "./api";

const app = new Hono();

app.use(logger());

app.use(
  "/",
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: import.meta.env.PROD
        ? ["'self'"]
        : ["'self'", "'unsafe-inline'"], // PROD以外では開発用のスクリプトを許可
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"], // 一部のスタイルをCDNから取得して利用しているため許可
      frameAncestors: ["'self'", "https://*.microcms.io"], // microCMSの管理画面でiframeで表示するため許可
    },
  }),
);

app.onError((err, _) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return new Response("Internal Server Error", { status: 500 });
});

// API route
app.route("/", apiRoute);

// Web page route
app.get("/", (c) => {
  return c.html(
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nacss" />
        <link rel="icon" type="image/svg+xml" href="/static/favicon.svg" />
        <link href="/static/style.css" rel="stylesheet" />
        {import.meta.env.PROD ? (
          <script type="module" src="/static/client.js" />
        ) : (
          <script type="module" src="/src/client/index.tsx" />
        )}
        <title>microcms-field-extension-ai-completion</title>
      </head>
      <body>
        <div id="app" />
      </body>
    </html>,
  );
});

export default app;
