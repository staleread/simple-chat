import path from 'node:path'
import AutoLoad from '@fastify/autoload'

const __dirname = import.meta.dirname

export default async (fastify, opts) => {
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
  })
}
