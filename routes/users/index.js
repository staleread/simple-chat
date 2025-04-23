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
      description: 'Get all users',
      tags: ['Users'],
      response: {
        200: {
          description: 'Successful response',
          type: 'array',
          items: { $ref: 'User' }
        }
      }
    },
    handler: async (req, reply) => {
      return await server.prisma.user.findMany()
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
          description: 'Successful response',
          $ref: 'User'
        },
        404: {
          description: 'Error response',
          $ref: 'HttpError'
        }
      }
    },
    handler: async (req, reply) => {
      const { userId } = req.params

      const user = await server.prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return reply.notFound('User not found')
      }
      return user
    }
  })
}
