import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  GETFKD_DEFAULT_MILES,
  applyGetFkdDiscoveryMiles,
  closenessFromRssi,
  hapticIntensity,
  shouldEmitProximityCue,
  sonarIntervalMs,
} from "./getfkdProximity.ts";

describe("Get Fk'd proximity cues", () => {
  it("defaults discovery to 1 mile when the mode turns on", () => {
    assert.equal(GETFKD_DEFAULT_MILES, 1);
    assert.equal(applyGetFkdDiscoveryMiles(true, null), 1);
    assert.equal(applyGetFkdDiscoveryMiles(true, 250), 1);
    assert.equal(applyGetFkdDiscoveryMiles(false, 40), 40);
  });

  it("makes stronger, faster cues as Bluetooth RSSI rises", () => {
    const far = closenessFromRssi(-90);
    const near = closenessFromRssi(-42);
    assert.ok(near > far);
    assert.ok(sonarIntervalMs(near) < sonarIntervalMs(far));
    assert.ok(hapticIntensity(near) > hapticIntensity(far));
    assert.equal(shouldEmitProximityCue(10_000, 9_800, far), false);
    assert.equal(shouldEmitProximityCue(10_000, 0, near), true);
    assert.equal(shouldEmitProximityCue(10_000, 9_900, near), false);
  });

  it("does not use kilometer copy in the intensity math", () => {
    assert.equal(/km|kilometer/.test(String(closenessFromRssi(-50))), false);
  });
});
