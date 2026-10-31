export const passwordRulesMessage =
  'Password must be more than 8 characters and include an uppercase letter, a lowercase letter and a special character.'

export const isStrongPassword = (password: string) => {
  return password.length > 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
}
