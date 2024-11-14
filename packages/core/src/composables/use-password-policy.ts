type Options = {
  minimumLength: number
  includeNumber?: boolean
  includeSymbol?: boolean
  includeCapital?: boolean
}

export const usePasswordPolicy = (options: Options = {
  minimumLength: 8,
}) => (password: string, confirmation: string) => {
  switch( true ) {
    case password.length < options.minimumLength:
      return `Password must contain at least ${options.minimumLength} digits`
    case options.includeNumber && !/[0-9]/.test(password):
      return 'Password must contain at least one number'
    case options.includeSymbol && !/[^\w]/.test(password):
      return 'Password must contain at least one symbol'
    case options.includeCapital && !/[A-Z]/.test(password):
      return 'Password must contain at least one capital letter'
    case password !== confirmation:
      return "Confirmation doesn't match"
  }
}
