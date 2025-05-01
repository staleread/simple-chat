import bcrypt from 'bcrypt'
import { PrismaClient } from '../generated/prisma/client.js'

const prisma = new PrismaClient()

const { ADMIN_PASSWORD: password, PASSWORD_SALT: salt } = process.env

if (!password || !salt) {
  console.error('Cannot seed admin user. Some data is missing')
  process.exit(1)
}

try {
  const passwordHash = await bcrypt.hash(password, salt)

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      bio: null,
      passwordHash,
      role: 'ADMIN'
    }
  })
} catch (err) {
  console.error(err)
} finally {
  await prisma.$disconnect()
}
