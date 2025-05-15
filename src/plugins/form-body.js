import formBody from '@fastify/formbody'

export default async server => {
  await server.register(formBody)
}
