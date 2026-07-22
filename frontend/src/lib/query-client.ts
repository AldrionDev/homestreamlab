import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api-client'

/**
 * Decides whether a failed query should be retried.
 *
 * Backend 4xx responses (not found, unauthorized, validation errors, etc.)
 * are not transient — retrying won't change the outcome, so we fail fast
 * and let the error state render immediately.
 *
 * Everything else (5xx responses, network failures, unexpected errors)
 * may be transient, so we allow a single retry before giving up.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false
  }
  return failureCount < 1
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
    },
  },
})
