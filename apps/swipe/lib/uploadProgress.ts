export const PREPARE_WEIGHT = 0.18;
export const UPLOAD_WEIGHT = 0.82;
export const IN_FLIGHT_CAP = 0.92;
export const DEFAULT_PREPARE_MS = 2_000;
export const DEFAULT_UPLOAD_MS = 12_000;

export type PhotoUploadStage = "prepare" | "upload" | "recover" | "done";

export type PhotoUploadSnapshot = {
  percent: number;
  label: string;
  remainingLabel: string;
  stage: PhotoUploadStage;
};

function inFlightRatio(elapsedMs: number, expectedMs: number): number {
  if (expectedMs <= 0) {
    return 0.08;
  }
  return Math.min(IN_FLIGHT_CAP, Math.max(0.08, elapsedMs / expectedMs));
}

export function photoUploadPercent(input: {
  fileCount: number;
  preparedCount: number;
  uploadedCount: number;
  stage: PhotoUploadStage;
  inFlightElapsedMs?: number;
  expectedStageMs?: number;
}): number {
  if (input.stage === "done") {
    return 100;
  }
  const total = Math.max(1, input.fileCount);
  const prepared = Math.min(total, Math.max(0, input.preparedCount));
  const uploaded = Math.min(total, Math.max(0, input.uploadedCount));
  const prepareDone = (prepared / total) * PREPARE_WEIGHT;
  const uploadDone = (uploaded / total) * UPLOAD_WEIGHT;
  let inflight = 0;
  const elapsed = input.inFlightElapsedMs ?? 0;
  if (input.stage === "prepare" && prepared < total) {
    inflight = (PREPARE_WEIGHT / total) * inFlightRatio(elapsed, input.expectedStageMs ?? DEFAULT_PREPARE_MS);
  } else if (input.stage === "upload" && uploaded < total) {
    inflight = (UPLOAD_WEIGHT / total) * inFlightRatio(elapsed, input.expectedStageMs ?? DEFAULT_UPLOAD_MS);
  } else if (input.stage === "recover") {
    inflight = (UPLOAD_WEIGHT / total) * IN_FLIGHT_CAP;
  }
  return Math.min(99, Math.max(1, Math.round((prepareDone + uploadDone + inflight) * 100)));
}

export function remainingUploadMs(elapsedMs: number, percent: number): number | null {
  if (percent < 8 || elapsedMs < 400) {
    return null;
  }
  if (percent >= 99) {
    return 800;
  }
  return Math.max(0, elapsedMs / (percent / 100) - elapsedMs);
}

export function formatRemainingMs(ms: number | null): string {
  if (ms == null) {
    return "Working out how long this will take…";
  }
  if (ms < 1_500) {
    return "A few seconds left";
  }
  const seconds = Math.max(1, Math.round(ms / 1000));
  if (seconds < 60) {
    return `About ${seconds} seconds left`;
  }
  const minutes = Math.max(1, Math.round(seconds / 60));
  return minutes === 1 ? "About 1 minute left" : `About ${minutes} minutes left`;
}

export function photoUploadStageLabel(stage: PhotoUploadStage, currentIndex: number, fileCount: number): string {
  const total = Math.max(1, fileCount);
  const shown = Math.min(total, Math.max(1, currentIndex + 1));
  if (stage === "prepare") {
    return `Preparing photo ${shown} of ${total}`;
  }
  if (stage === "upload") {
    return `Uploading photo ${shown} of ${total}`;
  }
  if (stage === "recover") {
    return "Checking photos already saved…";
  }
  return "Photos added";
}

export function snapshotPhotoUpload(input: {
  fileCount: number;
  preparedCount: number;
  uploadedCount: number;
  stage: PhotoUploadStage;
  startedAt: number;
  stageStartedAt: number;
  expectedStageMs: number;
  now: number;
}): PhotoUploadSnapshot {
  const currentIndex = input.stage === "prepare" ? input.preparedCount : input.uploadedCount;
  const percent = photoUploadPercent({
    fileCount: input.fileCount,
    preparedCount: input.preparedCount,
    uploadedCount: input.uploadedCount,
    stage: input.stage,
    inFlightElapsedMs: Math.max(0, input.now - input.stageStartedAt),
    expectedStageMs: input.expectedStageMs,
  });
  return {
    percent,
    label: photoUploadStageLabel(input.stage, currentIndex, input.fileCount),
    remainingLabel: formatRemainingMs(remainingUploadMs(Math.max(0, input.now - input.startedAt), percent)),
    stage: input.stage,
  };
}
