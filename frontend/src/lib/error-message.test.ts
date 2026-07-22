import { describe, expect, it } from 'vitest'
import { ApiError } from './api-client'
import { getErrorMessage } from './error-message'

const FALLBACK = 'Something went wrong. Please try again.'

describe('getErrorMessage', () => {
  it('returns the backend message for a 400 ApiError', () => {
    const error = new ApiError('Title is required.', 400, undefined)

    expect(getErrorMessage(error, FALLBACK)).toBe('Title is required.')
  })

  it('returns the backend message for a 404 ApiError', () => {
    const error = new ApiError('Media item not found.', 404, undefined)

    expect(getErrorMessage(error, FALLBACK)).toBe('Media item not found.')
  })

  it('returns the fallback for a 500 ApiError', () => {
    const error = new ApiError('Internal Server Error', 500, undefined)

    expect(getErrorMessage(error, FALLBACK)).toBe(FALLBACK)
  })

  it('returns the fallback for a network error', () => {
    const error = new TypeError('Failed to fetch')

    expect(getErrorMessage(error, FALLBACK)).toBe(FALLBACK)
  })

  it('returns the fallback for a non-error value', () => {
    expect(getErrorMessage('boom', FALLBACK)).toBe(FALLBACK)
    expect(getErrorMessage(null, FALLBACK)).toBe(FALLBACK)
    expect(getErrorMessage(undefined, FALLBACK)).toBe(FALLBACK)
  })
})
