import bcrypt from 'bcrypt'

export default server => {
  const salt = server.config.PASSWORD_SALT

  const hash = async plain => {
    return await bcrypt.hash(plain, salt)
  }

  const compareHash = async (plain, expectedHash) => {
    const actualHash = await bcrypt.hash(plain, salt)
    return actualHash === expectedHash
  }

  const userInfoSelect = {
    id: true,
    username: true,
    bio: true,
    role: true
  }

  return {
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
    register: async ({ username, bio, role, password }) => {
      const isUsernameTaken = await server.prisma.user.findUnique({
        where: { username },
        select: { id: true }
      })

      if (isUsernameTaken) {
        throw server.httpErrors.badRequest('Username is already taken')
      }

      const passwordHash = await hash(password)

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
    login: async ({ username, password }) => {
      const userInfo = await server.prisma.user.findUnique({
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

      const isPasswordCorrect = await compareHash(password, passwordHash)

      if (isPasswordCorrect) {
        return { id, role }
      }
      throw server.httpErrors.badRequest('Invalid credentials')
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
    resetPassword: async ({ id, newPassword }) => {
      const userExists = await server.prisma.user.findUnique({
        where: { id },
        select: { id: true }
      })

      if (!userExists) {
        throw server.httpErrors.notFound('User not found')
      }

      const passwordHash = await server.hash(newPassword)

      return await server.prisma.user.update({
        where: { id },
        data: { passwordHash },
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

      return await server.prisma.user.delete({
        where: { id },
        select: { id: true }
      })
    }
  }
}
