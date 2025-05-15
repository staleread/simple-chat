import cookie from '@fastify/cookie'

export default async server => {
  await server.register(cookie)
}
