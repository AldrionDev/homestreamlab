import { describe, expect, it } from 'vitest'
import { validateRegisterForm } from './register-validation'

const validValues = {
  email: 'user@example.com',
  displayName: 'User',
  password: 'password123',
}

describe('validateRegisterForm', () => {
  it('requires an email', () => {
    expect(validateRegisterForm({ ...validValues, email: '' })).toBe('Email is required.')
  })

  it('rejects an invalid email format', () => {
    expect(validateRegisterForm({ ...validValues, email: 'not-an-email' })).toBe(
      'Enter a valid email address.',
    )
  })

  it('requires a display name', () => {
    expect(validateRegisterForm({ ...validValues, displayName: '' })).toBe(
      'Display name is required.',
    )
  })

  it('requires a password', () => {
    expect(validateRegisterForm({ ...validValues, password: '' })).toBe('Password is required.')
  })

  it('rejects a password shorter than the minimum length', () => {
    expect(validateRegisterForm({ ...validValues, password: '123' })).toBe(
      'Password must be at least 6 characters.',
    )
  })

  it('returns null for a valid form', () => {
    expect(validateRegisterForm(validValues)).toBeNull()
  })
})
