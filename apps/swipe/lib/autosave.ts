import { useCallback, useRef } from "react";

export function snapshotKey(value: unknown): string {
  return JSON.stringify(value);
}

export function shouldPersist(savedKey: string, next: unknown): boolean {
  return snapshotKey(next) !== savedKey;
}

export function useCommitSave<T>(getValue: () => T | null | undefined, write: (value: T) => Promise<void>) {
  const savedRef = useRef("");
  const busyRef = useRef(false);
  const pendingRef = useRef(false);
  const getRef = useRef(getValue);
  const writeRef = useRef(write);
  getRef.current = getValue;
  writeRef.current = write;

  const markSaved = useCallback((value: T) => {
    savedRef.current = snapshotKey(value);
  }, []);

  const commit = useCallback(async () => {
    const value = getRef.current();
    if (!value || !shouldPersist(savedRef.current, value)) {
      return;
    }
    if (busyRef.current) {
      pendingRef.current = true;
      return;
    }
    busyRef.current = true;
    try {
      while (true) {
        const next = getRef.current();
        if (!next || !shouldPersist(savedRef.current, next)) {
          break;
        }
        await writeRef.current(next);
        savedRef.current = snapshotKey(getRef.current() ?? next);
      }
    } finally {
      busyRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        await commit();
      }
    }
  }, []);

  return { commit, markSaved };
}
