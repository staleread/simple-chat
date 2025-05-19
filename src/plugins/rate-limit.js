import rateLimit from '@fastify/rate-limit'

export default async server => {
  await server.register(rateLimit, {
    max: server.config.RATE_LIMIT,
    timeWindow: server.config.RATE_LIMIT_TIME_WINDOW
  })
}
