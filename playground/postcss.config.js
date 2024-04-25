export default {
  plugins: {
    autoprefixer: {},
    tailwindcss: {
      config: {
        prefix: 'tw-',
        darkMode: 'class',
        content: [
          './src/**.vue'
        ]
      },
    },
  },
}
