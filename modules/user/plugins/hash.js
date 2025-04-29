import bcrypt from 'bcrypt'

export default async (server, opts) => {
  const salt = server.config.PASSWORD_SALT

  server.decorate('hash', async plain => {
    return await bcrypt.hash(plain, salt)
  })

  server.decorate('compareHash', async (plain, expectedHash) => {
    const actualHash = await bcrypt.hash(plain, salt)
    return actualHash === expectedHash
  })
}
