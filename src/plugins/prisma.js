import { PrismaClient } from '../../prisma/client/client.js'

export default async server => {
  const prisma = new PrismaClient()

  await prisma.$connect()

  server.decorate('prisma', prisma)

  server.addHook('onClose', async server => {
    await server.prisma.$disconnect()
  })
}
