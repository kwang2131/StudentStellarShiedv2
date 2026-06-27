// Force the Next standalone server to bind to every interface inside Railway containers.
process.env.HOSTNAME = process.env.APP_LISTEN_HOST || "0.0.0.0";

await import(new URL("../.next/standalone/server.js", import.meta.url).href);
