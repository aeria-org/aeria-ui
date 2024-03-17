module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    (message) => {
      return /^RELEASING/.test(message)
    }
  ],
}
