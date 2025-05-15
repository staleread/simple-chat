import jwt from '@fastify/jwt'

export default async server => {
  server.register(jwt, {
    secret: server.config.JWT_SECRET,
    sign: {
      expiresIn: server.config.JWT_EXPIRES_IN
    },
    cookie: {
      cookieName: 'token',
      signed: false
    }
  })

  server.decorate('authenticate', async (req, reply) => {
    try {
      await req.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })

  server.decorate('authorize', (...roles) => async (req, reply) => {
    if (!roles.includes(req.user.role)) {
      return reply.forbidden(
        `Method only available for users with roles ${roles.join(', ')}`
      )
    }
  })
}
