import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

export default async server => {
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Simple chat',
        description: 'Lightweight API example',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          cookieAuth: {
            description: 'JWT with user id and role in payload',
            type: 'apiKey',
            in: 'cookie',
            name: 'token'
          }
        }
      },
      servers: [{ url: 'http://localhost:8000' }, { url: 'http://localhost' }]
    },
    hideUntagged: true,
    exposeRoute: true
  })

  await server.register(swaggerUi, {
    routePrefix: '/docs'
  })
}
