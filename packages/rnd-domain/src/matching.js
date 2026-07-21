import { adultCredentialIsValid } from "./adult.js";

export class RendezvousStore {
  #presence = new Map();
  #likes = new Set();
  #blocks = new Set();

  publishPresence({ profileId, region, issuedAtMs, expiresAtMs, adultCredential }) {
    if (!adultCredentialIsValid(adultCredential, { subjectId: profileId, nowMs: issuedAtMs })) {
      throw new Error("valid subject-bound adult credential required");
    }
    if (typeof region !== "string" || region.length < 1 || region.length > 64 || region.includes(",")) {
      throw new Error("invalid coarse region");
    }
    const ttlMs = expiresAtMs - issuedAtMs;
    if (!Number.isSafeInteger(ttlMs) || ttlMs < 1 || ttlMs > 120_000) {
      throw new Error("presence TTL must be between 1 and 120 seconds");
    }
    const lease = Object.freeze({ profileId, region, issuedAtMs, expiresAtMs });
    this.#presence.set(profileId, lease);
    return lease;
  }

  withdrawPresence(profileId) {
    return this.#presence.delete(profileId);
  }

  discover({ region, requesterProfileId, nowMs, limit = 20 }) {
    this.#expire(nowMs);
    return [...this.#presence.values()]
      .filter(
        (lease) =>
          lease.region === region &&
          lease.profileId !== requesterProfileId &&
          !this.#isBlocked(requesterProfileId, lease.profileId),
      )
      .map((lease) => lease.profileId)
      .toSorted()
      .slice(0, Math.max(0, Math.min(20, limit)));
  }

  recordLike({ senderProfileId, recipientProfileId, nowMs }) {
    if (senderProfileId === recipientProfileId) throw new Error("cannot like self");
    if (this.#isBlocked(senderProfileId, recipientProfileId)) throw new Error("interaction is blocked");

    this.#likes.add(pair(senderProfileId, recipientProfileId));
    if (!this.#likes.has(pair(recipientProfileId, senderProfileId))) return null;

    const [profileA, profileB] = [senderProfileId, recipientProfileId].toSorted();
    return Object.freeze({ profileA, profileB, matchedAtMs: nowMs });
  }

  block({ blockerProfileId, blockedProfileId }) {
    if (blockerProfileId === blockedProfileId) throw new Error("cannot block self");
    this.#blocks.add(pair(blockerProfileId, blockedProfileId));
    this.#likes.delete(pair(blockerProfileId, blockedProfileId));
    this.#likes.delete(pair(blockedProfileId, blockerProfileId));
  }

  #expire(nowMs) {
    for (const [profileId, lease] of this.#presence) {
      if (lease.expiresAtMs <= nowMs) this.#presence.delete(profileId);
    }
  }

  #isBlocked(left, right) {
    return this.#blocks.has(pair(left, right)) || this.#blocks.has(pair(right, left));
  }
}

function pair(left, right) {
  return `${left}\u0000${right}`;
}
