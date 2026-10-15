/** Error body produced by the PassCraft API (Nest validation or domain filter). */
export interface ApiErrorBody {
  statusCode: number
  error?: string
  message: string | string[]
}

/** Normalised error thrown by the Axios client for every failed request. */
export class ApiError extends Error {
  readonly status: number | null
  readonly code: string | undefined
  readonly details: string[]

  constructor(message: string, options: { status: number | null; code?: string; details?: string[] }) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.details = options.details ?? []
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isNetworkError(): boolean {
    return this.status === null
  }
}
