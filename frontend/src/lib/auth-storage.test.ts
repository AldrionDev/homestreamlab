import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearStoredAuth, readStoredAuth, writeStoredAuth } from './auth-storage'
import type { User } from './auth-storage'

class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length() {
    return this.store.size
  }
  clear = () => this.store.clear()
  getItem = (key: string) => this.store.get(key) ?? null
  key = (index: number) => Array.from(this.store.keys())[index] ?? null
  removeItem = (key: string) => this.store.delete(key)
  setItem = (key: string, value: string) => this.store.set(key, value)
}

const user: User = { id: '1', email: 'test@example.com', displayName: 'Test User' }

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage())
})

describe('readStoredAuth', () => {
  it('returns null when nothing is stored', () => {
    expect(readStoredAuth()).toBeNull()
  })

  it('returns null when only accessToken is present', () => {
    localStorage.setItem('accessToken', 'token')
    expect(readStoredAuth()).toBeNull()
  })

  it('returns null when only authUser is present', () => {
    localStorage.setItem('authUser', JSON.stringify(user))
    expect(readStoredAuth()).toBeNull()
  })

  it('returns null when authUser is invalid JSON', () => {
    localStorage.setItem('accessToken', 'token')
    localStorage.setItem('authUser', 'not-json')
    expect(readStoredAuth()).toBeNull()
  })

  it('returns the token and user when both are validly present', () => {
    localStorage.setItem('accessToken', 'token')
    localStorage.setItem('authUser', JSON.stringify(user))
    expect(readStoredAuth()).toEqual({ accessToken: 'token', user })
  })
})

describe('writeStoredAuth', () => {
  it('writes accessToken and JSON-stringified user', () => {
    writeStoredAuth('token', user)
    expect(localStorage.getItem('accessToken')).toBe('token')
    expect(localStorage.getItem('authUser')).toBe(JSON.stringify(user))
  })
})

describe('clearStoredAuth', () => {
  it('removes both keys', () => {
    writeStoredAuth('token', user)
    clearStoredAuth()
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('authUser')).toBeNull()
  })
})
