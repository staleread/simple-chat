import env from '@fastify/env'

export default async server => {
  await server.register(env, {
    schema: {
      type: 'object',
      properties: {
        PASSWORD_SALT: { type: 'string' },
        JWT_SECRET: { type: 'string' },
        JWT_EXPIRES_IN: { type: 'string' }
      },
      required: ['PASSWORD_SALT', 'JWT_SECRET', 'JWT_EXPIRES_IN']
    }
  })
}
