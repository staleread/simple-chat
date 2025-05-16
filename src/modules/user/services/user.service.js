const userInfoSelect = {
  id: true,
  username: true,
  bio: true,
  role: true
}

export default server => ({
  getAll: async ({ hasBio, usernameLike }) => {
    const where = {}

    if (hasBio !== undefined) {
      where.bio = hasBio ? { not: null } : null
    }

    if (usernameLike) {
      where.username = { contains: usernameLike }
    }
    return await server.prisma.user.findMany({
      where,
      select: userInfoSelect
    })
  },
  exist: async (...ids) => {
    const existentUsers = await server.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true }
    })

    return existentUsers.length === ids.length
  },
  get: async id => {
    const user = await server.prisma.user.findUnique({
      where: { id },
      select: userInfoSelect
    })

    if (!user) {
      throw server.httpErrors.notFound('User not found')
    }
    return user
  },
  create: async ({ username, bio, role, password }) => {
    const isUsernameTaken = await server.prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (isUsernameTaken) {
      throw server.httpErrors.badRequest('Username is already taken')
    }

    const passwordHash = await server.hash(password)

    return await server.prisma.user.create({
      data: {
        username,
        bio: bio ?? null,
        role,
        passwordHash
      },
      select: userInfoSelect
    })
  },
  update: async dto => {
    const isOnlyIdPresent = Object.keys(dto).length < 2

    if (isOnlyIdPresent) {
      throw server.httpErrors.badRequest('No fields to update were specified')
    }
    const userExists = await server.prisma.user.findUnique({
      where: { id: dto.id },
      select: { id: true }
    })

    if (!userExists) {
      throw server.httpErrors.notFound('User not found')
    }

    const isUsernameTakenByOther = await server.prisma.user.findFirst({
      where: {
        id: { not: dto.id },
        username: dto.username
      },
      select: { id: true }
    })

    if (isUsernameTakenByOther) {
      throw server.httpErrors.badRequest('Username is taken by other user')
    }

    return await server.prisma.user.update({
      where: { id: dto.id },
      data: {
        username: dto.username,
        bio: dto.bio
      },
      select: userInfoSelect
    })
  },
  delete: async id => {
    const userExists = await server.prisma.user.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!userExists) {
      throw server.httpErrors.notFound('User not found')
    }

    await server.prisma.user.delete({ where: { id } })
  },
  resetPassword: async ({ id, newPassword }) => {
    const userExists = await server.prisma.user.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!userExists) {
      throw server.httpErrors.notFound('User not found')
    }

    const passwordHash = await server.hash(newPassword)

    await server.prisma.user.update({
      where: { id },
      data: { passwordHash }
    })
  }
})
