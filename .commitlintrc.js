module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    (message) => {
      return message === 'Version Packages'
    }
  ],
}
