import { createServer, build as viteBuild } from 'vite'
import { fileURLToPath } from 'node:url'

const projectRoot = process.cwd()

export const serve = async () => {
  const server = await createServer({
    configFile: fileURLToPath(new URL('./vite.js', import.meta.url)),
    root: projectRoot,
    server: {
      port: 8080,
    },
  })

  await server.listen()
  server.printUrls()
}

export const build = async () => {
  const { default: config } = await import(fileURLToPath(new URL('./vite.js', import.meta.url)))

  return viteBuild(typeof config === 'function'
    ? await config()
    : config)

}
