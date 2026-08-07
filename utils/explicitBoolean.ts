export function parseExplicitBoolean(value: unknown): boolean {
  return typeof value === "string" && value.trim().toLowerCase() === "true";
}
