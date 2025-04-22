export default async (fastify, opts) => {
  fastify.route({
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
}
