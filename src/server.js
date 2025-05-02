import path from 'node:path'
import autoload from '@fastify/autoload'

export default async (server, opts) => {
  await server.register(autoload, {
    dir: path.join(import.meta.dirname, 'plugins'),
    encapsulate: false
  })

  await server.register(autoload, {
    dir: path.join(import.meta.dirname, 'modules'),
    encapsulate: false,
    maxDepth: 1
  })
}
