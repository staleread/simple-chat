export default async server => {
  const users = server.prisma.user

  server.decorate('filterUsers', async ({ hasBio, usernameLike }) => {
    const where = {}

    if (hasBio !== undefined) {
      where.bio = hasBio ? { not: null } : null
    }

    if (usernameLike) {
      where.username = { contains: usernameLike }
    }
    return await users.findMany({
      where,
      select: {
        id: true,
        username: true,
        bio: true,
        role: true
      }
    })
  })

  server.decorate('getUser', async id => {
    const user = await users.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        bio: true,
        role: true
      }
    })

    if (!user) {
      throw server.httpErrors.notFound('User not found')
    }
    return user
  })

  server.decorate('registerUser', async dto => {
    const isUsernameTaken = await users.findUnique({
      where: { username: dto.username },
      select: { id: true }
    })

    if (isUsernameTaken) {
      throw server.httpErrors.badRequest('Username is already taken')
    }

    const passwordHash = await server.hash(dto.password)

    return await users.create({
      data: {
        username: dto.username,
        bio: dto.bio ?? null,
        role: dto.role,
        passwordHash
      },
      select: {
        id: true,
        username: true,
        bio: true,
        role: true
      }
    })
  })

  server.decorate('loginUser', async ({ username, password }) => {
    const userInfo = await users.findUnique({
      where: { username },
      select: {
        id: true,
        role: true,
        passwordHash: true
      }
    })

    if (!userInfo) {
      throw server.httpErrors.badRequest('Invalid credentials')
    }

    const { id, role, passwordHash } = userInfo

    const isPasswordCorrect = await server.compareHash(password, passwordHash)

    if (isPasswordCorrect) {
      return { id, role }
    }
    throw server.httpErrors.badRequest('Invalid credentials')
  })

  server.decorate('updateUser', async dto => {
    const userExists = await users.findUnique({
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
      },
      select: {
        id: true,
        username: true,
        bio: true,
        role: true
      }
    })
  })

  server.decorate('deleteUser', async id => {
    const userExists = await users.findUnique({
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
  })
}
