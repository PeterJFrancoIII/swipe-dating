import { useCallback, useEffect, useRef, useState } from "react";

import {
  DEFAULT_PREPARE_MS,
  DEFAULT_UPLOAD_MS,
  snapshotPhotoUpload,
  type PhotoUploadSnapshot,
  type PhotoUploadStage,
} from "@/lib/uploadProgress";

type Live = {
  fileCount: number;
  preparedCount: number;
  uploadedCount: number;
  stage: PhotoUploadStage;
  startedAt: number;
  stageStartedAt: number;
  expectedStageMs: number;
};

export function usePhotoUploadProgress() {
  const [progress, setProgress] = useState<PhotoUploadSnapshot | null>(null);
  const live = useRef<Live | null>(null);

  const publish = useCallback(() => {
    const current = live.current;
    if (!current) {
      return;
    }
    setProgress(snapshotPhotoUpload({ ...current, now: Date.now() }));
  }, []);

  const ticking = Boolean(progress && progress.stage !== "done");
  useEffect(() => {
    if (!ticking) {
      return;
    }
    const id = setInterval(publish, 250);
    return () => clearInterval(id);
  }, [ticking, publish]);

  const start = useCallback(
    (fileCount: number) => {
      live.current = {
        fileCount: Math.max(1, fileCount),
        preparedCount: 0,
        uploadedCount: 0,
        stage: "prepare",
        startedAt: Date.now(),
        stageStartedAt: Date.now(),
        expectedStageMs: DEFAULT_PREPARE_MS,
      };
      publish();
    },
    [publish],
  );

  const prepareStart = useCallback(
    (index: number) => {
      const current = live.current;
      if (!current) {
        return;
      }
      current.stage = "prepare";
      current.preparedCount = index;
      current.stageStartedAt = Date.now();
      current.expectedStageMs = DEFAULT_PREPARE_MS;
      publish();
    },
    [publish],
  );

  const prepared = useCallback(
    (index: number) => {
      const current = live.current;
      if (!current) {
        return;
      }
      current.preparedCount = index + 1;
      publish();
    },
    [publish],
  );

  const uploadStart = useCallback(
    (index: number) => {
      const current = live.current;
      if (!current) {
        return;
      }
      current.stage = "upload";
      current.uploadedCount = index;
      current.stageStartedAt = Date.now();
      current.expectedStageMs = DEFAULT_UPLOAD_MS;
      publish();
    },
    [publish],
  );

  const uploaded = useCallback(
    (index: number, durationMs: number) => {
      const current = live.current;
      if (!current) {
        return;
      }
      current.uploadedCount = index + 1;
      current.expectedStageMs = Math.max(3_000, durationMs);
      publish();
    },
    [publish],
  );

  const recover = useCallback(() => {
    const current = live.current;
    if (!current) {
      return;
    }
    current.stage = "recover";
    current.stageStartedAt = Date.now();
    publish();
  }, [publish]);

  const done = useCallback(() => {
    const current = live.current;
    if (!current) {
      return;
    }
    current.stage = "done";
    current.preparedCount = current.fileCount;
    current.uploadedCount = current.fileCount;
    publish();
  }, [publish]);

  const clear = useCallback(() => {
    live.current = null;
    setProgress(null);
  }, []);

  return { progress, start, prepareStart, prepared, uploadStart, uploaded, recover, done, clear };
}
