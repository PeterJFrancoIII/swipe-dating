/** NAS finish requires Apple even when Metro is in __DEV__ (ADR-0023). Web stays anonymous. */
export function shouldShowAppleSignIn(appleBound: boolean, platform: string): boolean {
  return !appleBound && platform !== "web";
}
