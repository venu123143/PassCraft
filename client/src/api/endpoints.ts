/**
 * Every backend route the client calls, in one place.
 * Paths are relative to API_BASE_URL (configured on the Axios client).
 */
export const API_ENDPOINTS = {
  health: '/health',
  passes: {
    /** POST: create a pass and get its "Add to Google Wallet" link. */
    create: '/passes',
    /** GET: fetch one pass. */
    detail: (id: string) => `/passes/${encodeURIComponent(id)}`,
    /** POST: change the number and push it live to the wallet. */
    updateValue: (id: string) => `/passes/${encodeURIComponent(id)}`,
  },
} as const
