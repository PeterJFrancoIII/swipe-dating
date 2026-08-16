import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { alignmentLabel, quizProgressLabel } from "./alignment.ts";

describe("alignmentLabel", () => {
  it("hides a score until both sides participate", () => {
    assert.equal(alignmentLabel({ alignment: null, alignment_participating: true, alignment_answered: 6 }), null);
    assert.equal(alignmentLabel({ alignment: 72, alignment_participating: false, alignment_answered: 0 }), null);
  });

  it("shows percent and answered count for participating users", () => {
    assert.equal(
      alignmentLabel({
        alignment: 72.4,
        alignment_participating: true,
        alignment_answered: 4,
        alignment_total: 6,
      }),
      "72% · 4/6",
    );
    assert.equal(
      alignmentLabel({
        alignment: 72,
        alignment_participating: true,
        alignment_answered: 4,
      }),
      "72% · 4/200",
    );
  });
});

describe("quizProgressLabel", () => {
  it("includes the viewer answer count", () => {
    assert.equal(quizProgressLabel(0, 200), "Compatibility quiz · 0/200");
    assert.equal(quizProgressLabel(4, 200), "Compatibility quiz · 4/200");
  });
});
