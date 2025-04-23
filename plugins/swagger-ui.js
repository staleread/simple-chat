import swaggerUi from '@fastify/swagger-ui'
import fp from 'fastify-plugin'

export default fp(
  async (server, opts) => {
    await server.register(swaggerUi, {
      routePrefix: '/docs'
    })
  },
  {
    name: 'swagger-ui',
    dependencies: ['swagger']
  }
)
