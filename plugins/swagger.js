import swagger from '@fastify/swagger'
import fp from 'fastify-plugin'

export default fp(
  async (server, opts) => {
    await server.register(swagger, {
      openapi: {
        info: {
          title: 'Simple chat',
          description: 'Lightweight API example',
          version: '1.0.0'
        },
        servers: [
          {
            url: 'http://localhost:3000'
          }
        ]
      },
      hideUntagged: true,
      exposeRoute: true
    })
  },
  {
    name: 'swagger'
  }
)
