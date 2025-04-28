export default async (server, opts) => {
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
          type: 'object',
          properties: {
            statusCode: { const: 404 },
            error: { const: 'Not Found' },
            message: { const: 'User not found' }
          },
          required: ['statusCode', 'error', 'message']
        }
      }
    },
    handler: async (req, reply) => {
      const { id } = req.params
      return await server.users.get(id)
    }
  })

  server.addSchema({
    $id: 'UserCreate',
    type: 'object',
    properties: {
      username: {
        type: 'string',
        minLength: 2,
        maxLength: 30
      },
      bio: {
        type: ['string']
      }
    },
    required: ['username']
  })

  server.route({
    method: 'POST',
    url: '/',
    schema: {
      description: 'Create new user',
      tags: ['Users'],
      body: { $ref: 'UserCreate' },
      response: {
        201: {
          description: 'User Info',
          $ref: 'UserInfo'
        },
        400: {
          description: 'Username is already taken',
          type: 'object',
          properties: {
            statusCode: { const: 400 },
            error: { const: 'Bad Request' },
            message: { const: 'Username is already taken' }
          },
          required: ['statusCode', 'error', 'message']
        }
      }
    },
    handler: async (req, reply) => {
      const dto = req.body

      reply.code(201)
      return await server.users.create(dto)
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
          description: 'Username is taken by other user',
          type: 'object',
          properties: {
            statusCode: { const: 400 },
            error: { const: 'Bad Request' },
            message: { const: 'Username is taken by other user' }
          },
          required: ['statusCode', 'error', 'message']
        },
        404: {
          description: 'User not found',
          type: 'object',
          properties: {
            statusCode: { const: 404 },
            error: { const: 'Not Found' },
            message: { const: 'User not found' }
          },
          required: ['statusCode', 'error', 'message']
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
          type: 'object',
          properties: {
            statusCode: { const: 404 },
            error: { const: 'Not Found' },
            message: { const: 'User not found' }
          },
          required: ['statusCode', 'error', 'message']
        }
      }
    },
    handler: async (req, reply) => {
      const { id } = req.params
      return await server.users.delete(id)
    }
  })
}
