/** Store/preview still require Apple. Metro __DEV__ may skip while NAS has GETFKD_DEV_SKIP_APPLE. */
export function shouldShowAppleSignIn(
  appleBound: boolean,
  platform: string,
  options: { development?: boolean } = {},
): boolean {
  if (appleBound || platform === "web" || options.development) {
    return false;
  }
  return true;
}
