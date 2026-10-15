/** Field limits, kept identical to the server's DTO validation. */
export const PASS_RULES = {
  name: { max: 100 },
  label: { max: 50 },
  value: { min: 0, max: 1_000_000_000, maxDecimals: 2 },
} as const
