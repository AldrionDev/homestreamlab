const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

export interface RegisterFormValues {
  email: string
  displayName: string
  password: string
}

export function validateRegisterForm(values: RegisterFormValues): string | null {
  if (!values.email.trim()) {
    return 'Email is required.'
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    return 'Enter a valid email address.'
  }

  if (!values.displayName.trim()) {
    return 'Display name is required.'
  }

  if (!values.password) {
    return 'Password is required.'
  }

  if (values.password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  return null
}
