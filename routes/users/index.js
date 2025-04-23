export default async (server, opts) => {
  server.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
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
          }
        }
      }
    },
    handler: async (req, reply) => {
      return [
        {
          id: 12,
          username: 'nicolas',
          bio: null
        },
        {
          id: 14,
          username: 'nicolas442',
          bio: 'Something usual...'
        }
      ]
    }
  })

  server.route({
    method: 'GET',
    url: '/:userId',
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: {
            type: 'integer',
            minimum: 1
          }
        }
      },
      response: {
        200: {
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
        },
        404: { $ref: 'HttpError' }
      }
    },
    handler: async (req, reply) => {
      const { userId } = req.params

      if (userId === 13) {
        return reply.notFound('User not found')
      }
      return {
        id: userId,
        username: 'nicolas',
        bio: 'undefined...'
      }
    }
  })
}
