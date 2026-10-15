/** Splits a comma-separated env var into trimmed, non-empty entries. */
export function splitCsv(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * Private keys pasted into env vars (Render, .env files) usually carry
 * literal "\n" sequences instead of real newlines; PEM parsing needs the latter.
 */
export function normalizePrivateKey(raw: string | undefined): string {
  return (raw ?? '').replace(/\\n/g, '\n').trim();
}
