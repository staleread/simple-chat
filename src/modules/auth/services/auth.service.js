export default server => ({
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

    const isPasswordCorrect = await server.compareHash(password, passwordHash)

    if (!isPasswordCorrect) {
      throw server.httpErrors.badRequest('Invalid credentials')
    }
    return { id, role }
  }
})
