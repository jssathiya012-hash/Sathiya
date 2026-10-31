export const passwordChecks = (password: string) => ({
  length: password.length > 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  special: /[^A-Za-z0-9]/.test(password),
})

export const isValidPassword = (password: string) => Object.values(passwordChecks(password)).every(Boolean)