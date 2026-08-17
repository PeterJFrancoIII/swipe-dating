import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  appendNativeFilePart,
  isUnsupportedExpoFetchPart,
  nativeFilePart,
  nativeMultipartUploadOptions,
} from "./photoForm.ts";

describe("appendNativeFilePart", () => {
  it("stores the React Native {uri,name,type} part that XHR can stream", () => {
    const parts: unknown[] = [];
    appendNativeFilePart(
      {
        append(_name, value) {
          parts.push(value);
        },
      },
      "photo",
      { uri: "file:///tmp/selfie.heic", name: "photo-1.heic", type: "image/heic" },
    );
    assert.deepEqual(parts[0], nativeFilePart({
      uri: "file:///tmp/selfie.heic",
      name: "photo-1.heic",
      type: "image/heic",
    }));
    assert.equal(isUnsupportedExpoFetchPart(parts[0]), true);
  });
});

describe("isUnsupportedExpoFetchPart", () => {
  it("rejects the React Native {uri,name,type} shape that expo/fetch throws on", () => {
    assert.equal(
      isUnsupportedExpoFetchPart({
        uri: "file:///tmp/selfie.heic",
        name: "photo-1.heic",
        type: "image/heic",
      }),
      true,
    );
  });

  it("accepts strings, Blobs, and objects with bytes()", () => {
    assert.equal(isUnsupportedExpoFetchPart("live-token"), false);
    assert.equal(isUnsupportedExpoFetchPart(new Blob(["x"], { type: "image/jpeg" })), false);
    assert.equal(
      isUnsupportedExpoFetchPart({
        bytes: async () => new Uint8Array(),
        name: "photo-1.heic",
        type: "image/heic",
      }),
      false,
    );
  });
});

describe("nativeMultipartUploadOptions", () => {
  it("sends the session as a form parameter and names the file photo", () => {
    const options = nativeMultipartUploadOptions({
      token: " live-token ",
      mimeType: "image/heic",
      installId: "install-1",
      storeRelease: false,
      fieldName: "photo",
    });
    assert.equal(options.fieldName, "photo");
    assert.equal(options.parameters.session, "live-token");
    assert.equal(options.headers["X-Swipe-Session"], "live-token");
    assert.equal(options.headers["X-Getfkd-Install"], "install-1");
    assert.equal(options.headers["X-Getfkd-Release"], undefined);
    assert.equal(isUnsupportedExpoFetchPart({ uri: "file:///x", name: "a", type: "image/heic" }), true);
  });
});
