import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { LEGAL_DOCS, legalDoc } from "./legalDocs.ts";

describe("store privacy copy", () => {
  it("discloses Get Fk'd Bluetooth as on-device and optional", () => {
    const privacy = legalDoc("privacy")?.body ?? "";
    assert.match(privacy, /Get Fk'd mode/i);
    assert.match(privacy, /Bluetooth/i);
    assert.match(privacy, /off by default/i);
    assert.match(privacy, /not sent to the operator/i);
    assert.match(privacy, /foreground/i);
    assert.match(privacy, /filter underage/i);
    assert.equal(LEGAL_DOCS.some((doc) => doc.slug === "privacy"), true);
  });

  it("lists under-18 and NCII report reasons", () => {
    const community = legalDoc("community")?.body ?? "";
    assert.match(community, /Appears under 18/);
    assert.match(community, /Non-consensual intimate images/);
  });
});
