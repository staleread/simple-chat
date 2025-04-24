export default async (server, opts) => {
  const users = server.prisma.user

  server.decorate('users', {
    getAll: async ({ hasBio, usernameLike }) => {
      const where = {}

      if (hasBio !== undefined) {
        where.bio = hasBio ? { not: null } : null
      }

      if (usernameLike) {
        where.username = { contains: usernameLike }
      }
      return await users.findMany({ where })
    },
    get: async userId => {
      const user = await users.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw server.httpErrors.notFound('User not found')
      }
      return user
    },
    create: async dto => {
      const usesrnameIsTaken = await users.findFirst({
        where: { username: dto.username },
        select: { id: true }
      })

      if (usesrnameIsTaken) {
        throw server.httpErrors.badRequest('The username is already taken')
      }

      return await users.create({
        data: {
          username: dto.username,
          bio: dto.bio ?? null
        },
        select: { id: true }
      })
    },
    update: async dto => {
      const userExists = await users.findFirst({
        where: { id: dto.id },
        select: { id: true }
      })

      if (!userExists) {
        throw server.httpErrors.notFound('User not found')
      }

      const isUsernameTakenByOther = await users.findFirst({
        where: {
          id: { not: dto.id },
          username: dto.username
        },
        select: { id: true }
      })

      if (isUsernameTakenByOther) {
        throw server.httpErrors.badRequest('The username is already taken')
      }

      return await users.update({
        where: { id: dto.id },
        data: {
          username: dto.username,
          bio: dto.bio
        },
        select: { id: true }
      })
    }
  })
}
