import redis from '@fastify/redis'

export default async server => {
  await server.register(redis, { url: server.config.REDIS_URL })

  server.decorate('withCache', async (key, expiration, onCacheMiss) => {
    const rawValue = await server.redis.get(key)

    if (rawValue) {
      server.log.debug('Cache HIT')
      return JSON.parse(rawValue)
    }
    server.log.debug('Cache MISS')

    const value = await onCacheMiss()
    await server.redis.set(key, JSON.stringify(value), 'EX', expiration)

    return value
  })
}
