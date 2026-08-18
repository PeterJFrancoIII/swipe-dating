import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  hydrateOnboardingPhotos,
  nextOnboardingStep,
  photosSatisfyRequirement,
} from "./onboardingStep.ts";

describe("nextOnboardingStep", () => {
  it("does not return Sex when missing_fields is empty", () => {
    assert.equal(nextOnboardingStep([]), "continue_extras");
    assert.notEqual(nextOnboardingStep([]), "sex");
  });

  it("opens Photos when that required field is still missing", () => {
    assert.equal(nextOnboardingStep(["photos"]), "photos");
  });

  it("opens the first remaining required gap", () => {
    assert.equal(nextOnboardingStep(["location", "photos"]), "location");
  });
});

describe("hydrateOnboardingPhotos", () => {
  it("hydrates existing server photos into onboarding", () => {
    const photos = hydrateOnboardingPhotos([
      { slot: 0, url: "/api/profile/photos/0" },
      { slot: 1, url: "/api/profile/photos/1" },
    ]);
    assert.equal(photos.length, 2);
    assert.equal(photos[0]?.url, "/api/profile/photos/0");
    assert.equal(photos[1]?.url, "/api/profile/photos/1");
  });

  it("treats a missing photos array as empty", () => {
    assert.deepEqual(hydrateOnboardingPhotos(undefined), []);
  });
});

describe("photosSatisfyRequirement", () => {
  it("treats two or more server photos as satisfying Photos", () => {
    assert.equal(
      photosSatisfyRequirement([
        { slot: 0, url: "/api/profile/photos/0" },
        { slot: 1, url: "/api/profile/photos/1" },
      ]),
      true,
    );
    assert.equal(photosSatisfyRequirement([], 2), true);
    assert.equal(photosSatisfyRequirement([{ slot: 0, url: "/api/profile/photos/0" }]), false);
  });
});
