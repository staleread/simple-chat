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
    get: async id => {
      const user = await users.findUnique({
        where: { id }
      })

      if (!user) {
        throw server.httpErrors.notFound('User not found')
      }
      return user
    },
    register: async dto => {
      const isUsernameTaken = await users.findFirst({
        where: { username: dto.username },
        select: { id: true }
      })

      if (isUsernameTaken) {
        throw server.httpErrors.badRequest('Username is already taken')
      }

      const passwordHash = await server.password.hash(dto.password)

      return await users.create({
        data: {
          username: dto.username,
          bio: dto.bio ?? null,
          passwordHash
        }
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
        throw server.httpErrors.badRequest('Username is taken by other user')
      }

      return await users.update({
        where: { id: dto.id },
        data: {
          username: dto.username,
          bio: dto.bio
        }
      })
    },
    delete: async id => {
      const userExists = await users.findFirst({
        where: { id },
        select: { id: true }
      })

      if (!userExists) {
        throw server.httpErrors.notFound('User not found')
      }

      return await users.delete({
        where: { id },
        select: { id: true }
      })
    }
  })
}
