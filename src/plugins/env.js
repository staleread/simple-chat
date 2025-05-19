import env from '@fastify/env'

export default async server => {
  await server.register(env, {
    schema: {
      type: 'object',
      properties: {
        SERVER_URL: { type: 'string' },
        RATE_LIMIT: { type: 'integer', default: 100 },
        RATE_LIMIT_TIME_WINDOW: { type: 'integer', default: 60_000 },
        REDIS_URL: { type: 'string' },
        PASSWORD_SALT: { type: 'string' },
        JWT_SECRET: { type: 'string' },
        JWT_EXPIRES_IN: { type: 'string' }
      },
      required: ['PASSWORD_SALT', 'JWT_SECRET', 'JWT_EXPIRES_IN']
    }
  })
}
