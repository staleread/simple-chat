import env from '@fastify/env'

export default async server => {
  await server.register(env, {
    schema: {
      type: 'object',
      properties: {
        PORT: { type: 'integer', default: 8000 },
        RATE_LIMIT: { type: 'integer', default: 100 },
        RATE_LIMIT_TIME_WINDOW: { type: 'integer', default: 60_000 },
        SERVER_URL: { type: 'string' },
        REDIS_URL: { type: 'string' },
        ADMIN_PASSWORD: { type: 'string' },
        PASSWORD_SALT: { type: 'string' },
        JWT_SECRET: { type: 'string' },
        JWT_EXPIRES_IN: { type: 'string' }
      },
      required: [
        'RATE_LIMIT',
        'RATE_LIMIT_TIME_WINDOW',
        'SERVER_URL',
        'ADMIN_PASSWORD',
        'PASSWORD_SALT',
        'JWT_SECRET',
        'JWT_EXPIRES_IN'
      ]
    }
  })
}
