import bcrypt from 'bcrypt'
import fp from 'fastify-plugin'

export default fp(
  async (server, opts) => {
    const salt = server.config.PASSWORD_SALT
    server.decorate('password', {
      hash: async password => {
        server.log.info(salt)

        return await bcrypt.hash(password, salt)
      },
      check: async (password, hash) => {
        const actualHash = await bcrypt.hash(password, salt)
        return actualHash === hash
      }
    })
  },
  {
    name: 'password',
    dependencies: ['env', 'prisma']
  }
)
