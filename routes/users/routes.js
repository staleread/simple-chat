import fp from 'fastify-plugin'

export default fp(async (server, opts) => {
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
      tags: ['Users'],
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
    handler: async (req, reply) => {
      return await server.users.getAll(req.query)
    }
  })

  server.route({
    method: 'GET',
    url: '/:id',
    schema: {
      description: 'Get user by ID',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            minimum: 1
          }
        },
        required: ['id']
      },
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
    handler: async (req, reply) => {
      const { id } = req.params
      return await server.users.get(id)
    }
  })

  server.addSchema({
    $id: 'UserRegister',
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
      }
    },
    required: ['username', 'password']
  })

  server.route({
    method: 'POST',
    url: '/register',
    schema: {
      description: 'Register new user',
      tags: ['Users'],
      body: { $ref: 'UserRegister' },
      response: {
        201: {
          description: 'User Info',
          $ref: 'UserInfo'
        },
        400: {
          description: 'Validation error',
          $ref: 'HttpError'
        }
      }
    },
    handler: async (req, reply) => {
      const dto = req.body

      reply.code(201)
      return await server.users.register(dto)
    }
  })

  server.addSchema({
    $id: 'UserUpdate',
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
      }
    },
    required: ['id', 'username', 'bio']
  })

  server.route({
    method: 'PUT',
    url: '/',
    schema: {
      description: 'Update existent user',
      tags: ['Users'],
      body: { $ref: 'UserUpdate' },
      response: {
        200: {
          description: 'Updated user Info',
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
    handler: async (req, reply) => {
      const dto = req.body
      return await server.users.update(dto)
    }
  })

  server.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      description: 'Delete existent user',
      tags: ['Users'],
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
    handler: async (req, reply) => {
      const { id } = req.params
      return await server.users.delete(id)
    }
  })
})
