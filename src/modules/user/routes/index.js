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
      const { hasBio, usernameLike } = req.query
      return await userService.getAll({ hasBio, usernameLike })
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
      const { id, newPassword } = req.body
      return await userService.resetPassword({ id, newPassword })
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
      return await userService.delete(id)
    }
  })
}
