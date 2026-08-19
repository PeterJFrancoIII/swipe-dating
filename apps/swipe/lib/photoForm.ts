const SESSION_HEADER = "X-Swipe-Session";

export type NativeFilePart = { uri: string; name: string; type: string };

export function nativeFilePart(file: NativeFilePart): NativeFilePart {
  return { uri: file.uri, name: file.name, type: file.type };
}

export type FormWithNativeAppend = {
  append: (name: string, value: NativeFilePart | string) => unknown;
};

export function appendNativeFilePart(
  form: FormWithNativeAppend,
  fieldName: string,
  file: NativeFilePart,
): void {
  form.append(fieldName, nativeFilePart(file));
}

export function isUnsupportedExpoFetchPart(value: unknown): boolean {
  if (typeof value === "string") {
    return false;
  }
  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return false;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "bytes" in value &&
    typeof (value as { bytes?: unknown }).bytes === "function"
  ) {
    return false;
  }
  return true;
}

export function nativeMultipartUploadOptions(input: {
  token: string;
  mimeType: string;
  installId: string;
  storeRelease: boolean;
  fieldName: string;
  extraParameters?: Record<string, string>;
}): {
  httpMethod: "POST";
  fieldName: string;
  mimeType: string;
  parameters: Record<string, string>;
  headers: Record<string, string>;
  sessionType: "foreground";
} {
  const session = input.token.trim();
  const headers: Record<string, string> = {
    Accept: "application/json",
    [SESSION_HEADER]: session,
    "X-Getfkd-Install": input.installId,
  };
  if (input.storeRelease) {
    headers["X-Getfkd-Release"] = "store";
  }
  return {
    httpMethod: "POST",
    fieldName: input.fieldName,
    mimeType: input.mimeType,
    parameters: { session, ...input.extraParameters },
    headers,
    sessionType: "foreground",
  };
}
