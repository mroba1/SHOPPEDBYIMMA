/**
 * Returns `value` only if it's a path on this site ("/account", "/order/SBM-7K42P").
 * Blocks "//evil.com" and "https://…" so crafted links can't send people elsewhere.
 */
export function safeLocalPath(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  return /^\/(?!\/)[\w\-/?=&.]*$/.test(value) ? value : fallback;
}
