// STAGING stub — replace with authenticated API client when safety-console-api is live.
const STAGING = true;

async function loadCases() {
  if (STAGING) {
    console.info("safety-console: staging stub — no API configured");
    return [];
  }
  const res = await fetch("/v1/safety/cases", { credentials: "include" });
  if (!res.ok) throw new Error(`cases fetch failed: ${res.status}`);
  return res.json();
}

document.addEventListener("DOMContentLoaded", () => {
  loadCases().catch((err) => console.warn(err));
});
