import ws from '@fastify/websocket'

export default async server => {
  await server.register(ws)
}
