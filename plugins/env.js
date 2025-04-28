import env from '@fastify/env'
import fp from 'fastify-plugin'

export default fp(
  async (server, opts) => {
    await server.register(env, {
      dotenv: true,
      schema: {
        type: 'object',
        properties: {
          PASSWORD_SALT: {
            type: 'string'
          }
        },
        required: ['PASSWORD_SALT']
      }
    })
  },
  {
    name: 'env'
  }
)
