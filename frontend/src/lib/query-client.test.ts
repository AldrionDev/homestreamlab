import { describe, expect, it } from 'vitest'
import { ApiError } from './api-client'
import { shouldRetryQuery } from './query-client'

describe('shouldRetryQuery', () => {
  it('does not retry a 400 ApiError', () => {
    expect(shouldRetryQuery(0, new ApiError('Bad request', 400, undefined))).toBe(false)
  })

  it('does not retry a 401 ApiError', () => {
    expect(shouldRetryQuery(0, new ApiError('Unauthorized', 401, undefined))).toBe(false)
  })

  it('does not retry a 403 ApiError', () => {
    expect(shouldRetryQuery(0, new ApiError('Forbidden', 403, undefined))).toBe(false)
  })

  it('does not retry a 404 ApiError', () => {
    expect(shouldRetryQuery(0, new ApiError('Not found', 404, undefined))).toBe(false)
  })

  it('retries a 500 ApiError once, then stops', () => {
    const error = new ApiError('Internal Server Error', 500, undefined)
    expect(shouldRetryQuery(0, error)).toBe(true)
    expect(shouldRetryQuery(1, error)).toBe(false)
  })

  it('retries a network error once, then stops', () => {
    const error = new TypeError('Failed to fetch')
    expect(shouldRetryQuery(0, error)).toBe(true)
    expect(shouldRetryQuery(1, error)).toBe(false)
  })
})
