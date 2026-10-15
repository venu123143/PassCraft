/** Runtime configuration read from Vite env vars (see .env.example). */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
)

/** Abort API calls that take longer than this (Render free tier can cold-start slowly). */
export const API_TIMEOUT_MS = 60_000

export const APP_NAME = 'PassCraft'

/** Must match GOOGLE_CARD_TITLE on the server so the preview mirrors the real pass. */
export const PASS_CARD_TITLE = 'PassCraft'
