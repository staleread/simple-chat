import sensible from '@fastify/sensible'

export default async server => {
  await server.register(sensible, {
    sharedSchemaId: 'HttpError'
  })
}
