import { RendezvousStore, createAdultCredential } from "@swipe/rnd-domain";

export function createRequestHandler({ store = new RendezvousStore(), now = () => Date.now() } = {}) {
  return async function handle(request) {
    const url = new URL(request.url, "http://127.0.0.1");

    if (request.method === "GET" && url.pathname === "/healthz") {
      return json(200, { status: "ok", mode: "javascript-rnd-synthetic-only" });
    }

    if (request.method === "PUT" && url.pathname === "/v1/presence") {
      try {
        const body = await readJson(request);
        const adultCredential = createAdultCredential(body.adultCredential);
        const lease = store.publishPresence({ ...body, adultCredential });
        return json(200, lease);
      } catch (error) {
        return json(400, { error: error instanceof Error ? error.message : "bad_request" });
      }
    }

    if (request.method === "DELETE" && url.pathname.startsWith("/v1/presence/")) {
      const profileId = decodeURIComponent(url.pathname.slice("/v1/presence/".length));
      return json(200, { withdrawn: store.withdrawPresence(profileId) });
    }

    if (request.method === "GET" && url.pathname === "/v1/discovery") {
      const region = url.searchParams.get("region") ?? "";
      const requesterProfileId = url.searchParams.get("requesterProfileId") ?? "";
      try {
        return json(200, {
          profileIds: store.discover({ region, requesterProfileId, nowMs: now() }),
        });
      } catch (error) {
        return json(400, { error: error instanceof Error ? error.message : "bad_request" });
      }
    }

    if (request.method === "POST" && url.pathname === "/v1/likes") {
      try {
        const body = await readJson(request);
        const receipt = store.recordLike({ ...body, nowMs: now() });
        return json(200, { matched: receipt !== null, receipt });
      } catch (error) {
        return json(400, { error: error instanceof Error ? error.message : "bad_request" });
      }
    }

    if (request.method === "POST" && url.pathname === "/v1/blocks") {
      try {
        const body = await readJson(request);
        store.block(body);
        return json(204, null);
      } catch (error) {
        return json(400, { error: error instanceof Error ? error.message : "bad_request" });
      }
    }

    return json(404, { error: "not_found" });
  };
}

function json(status, value) {
  const body = value === null ? "" : JSON.stringify(value);
  return { status, headers: { "content-type": "application/json" }, body };
}

async function readJson(request) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > 65_536) throw new Error("request body too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
