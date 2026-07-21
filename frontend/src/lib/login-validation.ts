const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface LoginFormValues {
  email: string
  password: string
}

export function validateLoginForm(values: LoginFormValues): string | null {
  if (!values.email.trim()) {
    return 'Email is required.'
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    return 'Enter a valid email address.'
  }

  if (!values.password) {
    return 'Password is required.'
  }

  return null
}
