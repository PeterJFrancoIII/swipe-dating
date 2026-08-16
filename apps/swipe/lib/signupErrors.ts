export function isSessionRequired(code: string): boolean {
  return code === "session_required";
}

export function signupErrorMessage(code: string, fallback: string): string {
  if (code === "signup_unauthentic") {
    return "This signup could not be verified.";
  }
  if (code === "signup_rate_limited") {
    return "Slow down and try again later.";
  }
  if (code === "photo_reused") {
    return "Choose a different photo.";
  }
  if (code === "apple_sign_in_required") {
    return "Sign in with Apple is required.";
  }
  if (code === "session_required") {
    return "Your session expired. Try again.";
  }
  return fallback;
}
