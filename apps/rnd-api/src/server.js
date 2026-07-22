import { createServer } from "node:http";

import { createRequestHandler } from "./app.js";

const handle = createRequestHandler();
const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? "127.0.0.1";

const server = createServer(async (request, response) => {
  const result = await handle(request);
  response.writeHead(result.status, result.headers);
  response.end(result.body);
});

server.listen(port, host, () => {
  console.log(`Swipe JavaScript R&D API listening on http://${host}:${port}`);
});
