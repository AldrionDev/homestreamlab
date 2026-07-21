export interface User {
  id: string
  email: string
  displayName: string | null
}

const ACCESS_TOKEN_KEY = 'accessToken'
const AUTH_USER_KEY = 'authUser'

export function readStoredAuth(): { accessToken: string; user: User } | null {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  const rawUser = localStorage.getItem(AUTH_USER_KEY)
  if (!accessToken || !rawUser) return null

  try {
    const user = JSON.parse(rawUser) as User
    return { accessToken, user }
  } catch {
    return null
  }
}

export function writeStoredAuth(accessToken: string, user: User): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function clearStoredAuth(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}
