import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mergeSafetyReportOptions } from "./reportOptions.ts";

describe("mergeSafetyReportOptions", () => {
  it("puts under-18 and NCII first and does not duplicate them", () => {
    const merged = mergeSafetyReportOptions([
      { id: "scam", label: "Scam" },
      { id: "under_18", label: "Appears under 18" },
    ]);
    assert.equal(merged[0]?.id, "under_18");
    assert.equal(merged[1]?.id, "ncii");
    assert.equal(merged.filter((option) => option.id === "under_18").length, 1);
    assert.equal(merged.some((option) => option.id === "scam"), true);
  });
});
