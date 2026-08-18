import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatRemainingMs,
  photoUploadPercent,
  photoUploadStageLabel,
  remainingUploadMs,
  snapshotPhotoUpload,
} from "./uploadProgress.ts";

describe("photoUploadPercent", () => {
  it("starts above zero once prepare begins", () => {
    const percent = photoUploadPercent({
      fileCount: 2,
      preparedCount: 0,
      uploadedCount: 0,
      stage: "prepare",
      inFlightElapsedMs: 0,
    });
    assert.ok(percent >= 1);
    assert.ok(percent < 20);
  });

  it("moves through the upload slice without reaching 100 until done", () => {
    const mid = photoUploadPercent({
      fileCount: 2,
      preparedCount: 2,
      uploadedCount: 0,
      stage: "upload",
      inFlightElapsedMs: 6_000,
      expectedStageMs: 12_000,
    });
    assert.ok(mid > 20);
    assert.ok(mid < 80);
    assert.equal(
      photoUploadPercent({
        fileCount: 2,
        preparedCount: 2,
        uploadedCount: 2,
        stage: "done",
      }),
      100,
    );
  });
});

describe("remaining time copy", () => {
  it("waits for enough signal before estimating", () => {
    assert.equal(remainingUploadMs(200, 4), null);
    assert.equal(formatRemainingMs(null), "Working out how long this will take…");
  });

  it("speaks in seconds and minutes", () => {
    assert.equal(formatRemainingMs(18_000), "About 18 seconds left");
    assert.equal(formatRemainingMs(70_000), "About 1 minute left");
  });
});

describe("photoUploadStageLabel", () => {
  it("names the current photo", () => {
    assert.equal(photoUploadStageLabel("prepare", 0, 2), "Preparing photo 1 of 2");
    assert.equal(photoUploadStageLabel("upload", 1, 2), "Uploading photo 2 of 2");
  });
});

describe("snapshotPhotoUpload", () => {
  it("pairs a percent with remaining copy", () => {
    const snap = snapshotPhotoUpload({
      fileCount: 2,
      preparedCount: 2,
      uploadedCount: 1,
      stage: "upload",
      startedAt: 0,
      stageStartedAt: 10_000,
      expectedStageMs: 12_000,
      now: 16_000,
    });
    assert.ok(snap.percent > 50);
    assert.ok(snap.percent < 100);
    assert.match(snap.remainingLabel, /left/);
    assert.equal(snap.label, "Uploading photo 2 of 2");
  });
});
