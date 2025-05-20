import authServiceFactory from '../services/auth.service.js'

export default server => {
  const authService = authServiceFactory(server)

  server.route({
    method: 'GET',
    url: '/login',
    handler: (req, reply) => reply.viewAsync('layouts/login-page.eta')
  })

  server.route({
    method: 'POST',
    url: '/login',
    schema: {
      description: 'Login user',
      tags: ['Auth'],
      body: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            minLength: 2,
            maxLength: 30
          },
          password: {
            type: 'string',
            minLength: 4,
            maxLength: 128
          }
        },
        required: ['username', 'password']
      }
    },
    attachValidation: true,
    handler: async (req, reply) => {
      if (req.validationError) {
        return await reply.viewAsync('layouts/login-page.eta', {
          error: req.validationError
        })
      }

      const { username, password } = req.body

      const [error, payload] = await server.to(
        authService.login({ username, password })
      )
      if (error)
        return await reply.viewAsync('layouts/login-page.eta', { error })

      const token = await reply.jwtSign(payload)

      reply.setCookie('token', token, {
        path: '/',
        httpOnly: true
      })
      return reply.redirect('/chat/')
    }
  })
}
