import axios, { AxiosError, type AxiosInstance } from 'axios'
import { API_BASE_URL, API_TIMEOUT_MS } from '@/constants/config'
import { ApiError, type ApiErrorBody } from '@/types/api.types'

/** Turns any Axios failure into a predictable ApiError with a readable message. */
function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError('Something unexpected happened. Try again.', { status: null })
  }

  const axiosError = error as AxiosError<Partial<ApiErrorBody>>
  const response = axiosError.response

  if (!response) {
    const timedOut = axiosError.code === AxiosError.ECONNABORTED || axiosError.code === 'ETIMEDOUT'
    return new ApiError(
      timedOut
        ? 'The server took too long to respond. If it was asleep, try again in a few seconds.'
        : `Can't reach the server at ${API_BASE_URL}. Check that the API is running.`,
      { status: null, code: axiosError.code },
    )
  }

  const raw = response.data?.message
  const details = Array.isArray(raw) ? raw : raw ? [raw] : []
  const message = details[0] ?? `Request failed with status ${response.status}.`

  return new ApiError(message, {
    status: response.status,
    code: response.data?.error,
    details,
  })
}

/** Shared Axios instance for every PassCraft API call. */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)
