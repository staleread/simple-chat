import fp from 'fastify-plugin'
import { PrismaClient } from '../generated/prisma/client.js'

export default fp(async (server, opts) => {
  const prisma = new PrismaClient()

  await prisma.$connect()

  server.decorate('prisma', prisma)

  server.addHook('onClose', async server => {
    await server.prisma.$disconnect()
  })
})
