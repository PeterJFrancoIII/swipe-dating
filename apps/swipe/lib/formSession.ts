type FormLike = {
  append: (name: string, value: string) => unknown;
  getAll?: (name: string) => unknown[];
};

export function isFormBody(body: unknown): body is FormLike {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as FormLike).append === "function"
  );
}

export function attachSessionField(form: FormLike, token: string): void {
  const session = token.trim();
  if (!session) {
    return;
  }
  const existing = typeof form.getAll === "function" ? form.getAll("session") : [];
  if (existing.length > 0) {
    return;
  }
  form.append("session", session);
}
