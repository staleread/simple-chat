import userServiceFactory from '../services/user.service.js'

export default server => {
  const userService = userServiceFactory(server)

  server.addSchema({
    $id: 'UserInfo',
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        minimum: 1
      },
      username: {
        type: 'string',
        minLength: 2,
        maxLength: 30
      },
      bio: {
        type: ['string', 'null']
      },
      role: {
        enum: ['ADMIN', 'REGULAR']
      }
    },
    required: ['id', 'username', 'bio']
  })

  server.route({
    method: 'GET',
    url: '/',
    schema: {
      description: 'Get list of users',
      tags: ['User'],
      security: [{ cookieAuth: [] }],
      query: {
        type: 'object',
        properties: {
          hasBio: {
            description: 'Whether searched users must have (no) bio present',
            type: 'boolean'
          },
          usernameLike: {
            description: 'A username search string',
            type: 'string'
          }
        }
      },
    },
    onRequest: [server.authenticate],
    handler: async (req, reply) => {
      const { hasBio, usernameLike } = req.query
      const users = await userService.getAll({ hasBio, usernameLike })
      return await reply.viewAsync('/layouts/users-page.eta', { users })
    }
  })

  server.route({
    method: 'GET',
    url: '/me',
    schema: {
      description: 'Get current user info',
      tags: ['User'],
      security: [{ cookieAuth: [] }],
      response: {
        200: {
          description: 'User info',
          $ref: 'UserInfo'
        },
        404: {
          description: 'User not found',
          $ref: 'HttpError'
        }
      }
    },
    onRequest: [server.authenticate],
    handler: async (req, reply) => {
      return await userService.get(req.user.id)
    }
  })

  server.route({
    method: 'POST',
    url: '/',
    schema: {
      description: 'Register new user',
      tags: ['User'],
      security: [{ cookieAuth: [] }],
      body: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            minLength: 2,
            maxLength: 20,
            pattern: '^[a-zA-Z_]*[a-zA-Z0-9_]$'
          },
          bio: {
            type: 'string'
          },
          password: {
            type: 'string',
            minLength: 4,
            maxLength: 128
          },
          role: { enum: ['REGULAR', 'ADMIN'] }
        },
        required: ['username', 'password', 'role']
      },
      response: {
        201: {
          description: 'User info',
          $ref: 'UserInfo'
        },
        400: {
          description: 'Validation error',
          $ref: 'HttpError'
        }
      }
    },
    onRequest: [server.authenticate, server.authorize('ADMIN')],
    handler: async (req, reply) => {
      const { username, bio, role, password } = req.body

      reply.code(201)
      return await userService.create({ username, bio, role, password })
    }
  })

  server.route({
    method: 'PATCH',
    url: '/',
    schema: {
      description: 'Update user info',
      tags: ['User'],
      security: [{ cookieAuth: [] }],
      body: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            minLength: 2,
            maxLength: 30
          },
          bio: {
            type: ['string', 'null']
          }
        }
      },
      response: {
        200: {
          description: 'Updated user info',
          $ref: 'UserInfo'
        },
        400: {
          description: 'Validation error',
          $ref: 'HttpError'
        },
        404: {
          description: 'User not found',
          $ref: 'HttpError'
        }
      }
    },
    onRequest: [server.authenticate],
    handler: async (req, reply) => {
      const dto = { ...req.body, id: req.user.id }
      return await userService.update(dto)
    }
  })

  server.route({
    method: 'PATCH',
    url: '/reset',
    schema: {
      description: 'Reset user password',
      tags: ['User'],
      security: [{ cookieAuth: [] }],
      body: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            minimum: 1
          },
          newPassword: {
            type: 'string',
            minLength: 2,
            maxLength: 30
          }
        },
        required: ['id', 'newPassword']
      },
      response: {
        200: {
          description: 'Successful response',
          type: 'object',
          properties: {
            success: { const: true }
          },
          required: ['success']
        },
        400: {
          description: 'Validation error',
          $ref: 'HttpError'
        },
        404: {
          description: 'User not found',
          $ref: 'HttpError'
        }
      }
    },
    onRequest: [server.authenticate, server.authorize('ADMIN')],
    handler: async (req, reply) => {
      const { id, newPassword } = req.body
      await userService.resetPassword({ id, newPassword })

      return { success: true }
    }
  })

  server.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      description: 'Delete existent user',
      tags: ['User'],
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: {
            description: 'User id',
            type: 'integer',
            minimum: 1
          }
        },
        required: ['id']
      },
      response: {
        200: {
          description: 'Successful response',
          type: 'object',
          properties: {
            success: { const: true }
          },
          required: ['success']
        },
        404: {
          description: 'User not found',
          $ref: 'HttpError'
        }
      }
    },
    onRequest: [server.authenticate, server.authorize('ADMIN')],
    handler: async (req, reply) => {
      const { id } = req.params
      await userService.delete(id)

      return { success: true }
    }
  })
}
