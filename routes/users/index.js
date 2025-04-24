export default async (server, opts) => {
  const users = server.prisma.user

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
      const { hasBio, usernameLike } = req.query
      const where = {}

      if (hasBio !== undefined) {
        where.bio = hasBio ? { not: null } : null
      }

      if (usernameLike) {
        where.username = { contains: usernameLike }
      }
      return await users.findMany({ where })
    }
  })

  server.route({
    method: 'GET',
    url: '/:userId',
    schema: {
      description: 'Get user by ID',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          userId: {
            description: 'User ID',
            type: 'integer',
            minimum: 1
          }
        }
      },
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
      const { userId } = req.params

      const user = await users.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return reply.notFound('User not found')
      }
      return user
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
          description: 'Successful response',
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              minimum: 1
            }
          },
          required: ['id']
        },
        400: {
          description: 'Username is already taken',
          $ref: 'HttpError'
        }
      }
    },
    handler: async (req, reply) => {
      const dto = req.body

      const usesrnameIsTaken = await users.findFirst({
        where: { username: dto.username },
        select: { id: true }
      })

      if (usesrnameIsTaken) {
        return reply.badRequest('The username is already taken')
      }

      reply.code(201)

      return await users.create({
        data: {
          username: dto.username,
          bio: dto.bio ?? null
        },
        select: { id: true }
      })
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
          description: 'Empty object indication success',
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              minimum: 1
            }
          },
          required: ['id']
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

      const userExists = await users.findFirst({
        where: { id: dto.id },
        select: { id: true }
      })

      if (!userExists) {
        return reply.notFound('User not found')
      }

      const isUsernameTakenByOther = await users.findFirst({
        where: {
          id: { not: dto.id },
          username: dto.username
        },
        select: { id: true }
      })

      if (isUsernameTakenByOther) {
        return reply.badRequest('The username is already taken')
      }

      return await users.update({
        where: { id: dto.id },
        data: {
          username: dto.username,
          bio: dto.bio
        },
        select: { id: true }
      })
    }
  })
}
