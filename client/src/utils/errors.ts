import { ApiError } from '@/types/api.types'

/** Picks the most useful message from any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 502) {
      return `Google Wallet rejected the request. ${error.message}`
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Something unexpected happened. Try again.'
}
