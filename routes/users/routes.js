export default async (server, opts) => {
  server.addSchema({
    $id: 'User',
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
          items: { $ref: 'User' }
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
      params: { $ref: 'UserId' },
      response: {
        200: {
          description: 'User info',
          $ref: 'User'
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

  server.addSchema({
    $id: 'UserId',
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        minimum: 1
      }
    },
    required: ['id']
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
          description: 'Successful response',
          $ref: 'UserId'
        },
        400: {
          description: 'Username is already taken',
          $ref: 'HttpError'
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
          description: 'Successful response',
          $ref: 'UserId'
        },
        400: {
          description: 'Updated username is taken by other user',
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
      params: { $ref: 'UserId' },
      response: {
        200: {
          description: 'Successful response',
          $ref: 'UserId'
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
}
