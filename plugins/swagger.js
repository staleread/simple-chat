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
          BearerAuth: {
            description: 'JWT with user id and role in payload',
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
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

  await server.register(swaggerUi, {
    routePrefix: '/docs'
  })
}
