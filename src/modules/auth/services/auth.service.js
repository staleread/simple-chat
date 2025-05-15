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

  return {
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
    }
  }
}
