export function sanitizeInput(value: string, maxLength = 500): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[<>'"&]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeObject<T extends Record<string, string>>(
  obj: T,
  maxLength = 500
): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, sanitizeInput(v, maxLength)])
  ) as T;
}
