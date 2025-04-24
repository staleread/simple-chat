import path from 'node:path'
import autoload from '@fastify/autoload'

const __dirname = import.meta.dirname

export default async (server, opts) => {
  server.register(autoload, {
    dir: path.join(__dirname, 'plugins')
  })

  server.register(autoload, {
    dir: path.join(__dirname, 'routes'),
    autoHooks: true
  })
}
