import sensible from '@fastify/sensible'
import fp from 'fastify-plugin'

export default fp(async server => {
  await server.register(sensible, {
    sharedSchemaId: 'HttpError'
  })
})
