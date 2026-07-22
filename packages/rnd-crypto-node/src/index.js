import { createHmac, randomBytes } from "node:crypto";

export function randomSessionNonce() {
  return randomBytes(16).toString("hex");
}

export function deriveRotatingEncounterId({ secret, epoch, sessionNonceHex }) {
  if (!Buffer.isBuffer(secret) || secret.length < 32) {
    throw new TypeError("secret must be a Buffer containing at least 32 bytes");
  }
  if (!Number.isSafeInteger(epoch) || epoch < 0) throw new RangeError("invalid epoch");
  if (!/^[a-f0-9]{32}$/i.test(sessionNonceHex)) throw new TypeError("invalid session nonce");
  const payload = Buffer.concat([
    Buffer.from("swipe-rnd-proximity-v1\0", "utf8"),
    uint64be(epoch),
    Buffer.from(sessionNonceHex, "hex"),
  ]);
  return createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);
}

export function derivePairwiseQuotaKey({ serverSecret, service, subjectToken, epoch }) {
  if (!Buffer.isBuffer(serverSecret) || serverSecret.length < 32) {
    throw new TypeError("serverSecret must contain at least 32 bytes");
  }
  if (!service || !subjectToken) throw new TypeError("service and subject token are required");
  const payload = Buffer.concat([
    Buffer.from("swipe-rnd-quota-v1\0", "utf8"),
    Buffer.from(service, "utf8"),
    Buffer.from([0]),
    Buffer.from(subjectToken, "utf8"),
    Buffer.from([0]),
    uint64be(epoch),
  ]);
  return createHmac("sha256", serverSecret).update(payload).digest("hex");
}

function uint64be(value) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(value));
  return buffer;
}
