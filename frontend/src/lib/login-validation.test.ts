import { describe, expect, it } from 'vitest'
import { validateLoginForm } from './login-validation'

const validValues = {
  email: 'user@example.com',
  password: 'password123',
}

describe('validateLoginForm', () => {
  it('requires an email', () => {
    expect(validateLoginForm({ ...validValues, email: '' })).toBe('Email is required.')
  })

  it('rejects an invalid email format', () => {
    expect(validateLoginForm({ ...validValues, email: 'not-an-email' })).toBe(
      'Enter a valid email address.',
    )
  })

  it('requires a password', () => {
    expect(validateLoginForm({ ...validValues, password: '' })).toBe('Password is required.')
  })

  it('returns null for a valid form', () => {
    expect(validateLoginForm(validValues)).toBeNull()
  })
})
