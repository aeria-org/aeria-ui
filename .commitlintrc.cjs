//
module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    (message) => {
      return !!process.env.GITHUB_ACTIONS
    }
  ],
}
