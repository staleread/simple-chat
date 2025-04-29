export default async server => {
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
      security: [{ BearerAuth: [] }],
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
      response: {
        200: {
          description: 'Filtered list of users',
          type: 'array',
          items: { $ref: 'UserInfo' }
        }
      }
    },
    onRequest: [server.authenticate],
    handler: async (req, reply) => {
      return await server.filterUsers(req.query)
    }
  })

  server.route({
    method: 'GET',
    url: '/me',
    schema: {
      description: 'Get current user info',
      tags: ['User'],
      security: [{ BearerAuth: [] }],
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
      return await server.getUser(req.user.id)
    }
  })

  server.route({
    method: 'POST',
    url: '/register',
    schema: {
      description: 'Register new user',
      tags: ['User'],
      security: [{ BearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            minLength: 2,
            maxLength: 30
          },
          bio: {
            type: ['string']
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
      const dto = req.body

      reply.code(201)
      return await server.registerUser(dto)
    }
  })

  server.route({
    method: 'POST',
    url: '/login',
    schema: {
      description: 'Login user',
      tags: ['User'],
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
      },
      response: {
        200: {
          description: 'JWT token',
          type: 'object',
          properties: {
            token: { type: 'string' }
          },
          required: ['token']
        },
        400: {
          description: 'Validation error',
          $ref: 'HttpError'
        }
      }
    },
    handler: async (req, reply) => {
      const dto = req.body
      const payload = await server.loginUser(dto)
      const token = await reply.jwtSign(payload)

      return { token }
    }
  })

  server.route({
    method: 'PATCH',
    url: '/',
    schema: {
      description: 'Update user info',
      tags: ['User'],
      security: [{ BearerAuth: [] }],
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
      return await server.updateUser(dto)
    }
  })

  server.route({
    method: 'PATCH',
    url: '/password',
    schema: {
      description: 'Reset user password',
      tags: ['User'],
      security: [{ BearerAuth: [] }],
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
          description: 'Updated user info',
          const: ''
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
      const dto = req.body
      return await server.resetUserPassword(dto)
    }
  })

  server.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      description: 'Delete existent user',
      tags: ['User'],
      security: [{ BearerAuth: [] }],
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
          const: ''
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
      return await server.deleteUser(id)
    }
  })
}
