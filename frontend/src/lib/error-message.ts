import { ApiError } from './api-client'

/**
 * Returns a message that is safe to show to the user.
 *
 * Backend 4xx messages are written for users, so they are shown as-is.
 * Everything else (5xx, network failures, unexpected values) would expose
 * internal text like "Internal Server Error" or "Failed to fetch",
 * so the caller's fallback is used instead.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return error.message
  }
  return fallback
}
