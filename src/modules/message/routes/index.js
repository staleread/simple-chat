export default async server => {
  server.addSchema({
    $id: 'Message',
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        minimum: 1
      },
      content: {
        type: 'string',
        minLength: 1,
        maxLength: 1024
      },
      createdAt: {
        type: 'string',
        format: 'date-time'
      },
      sender: {
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
          }
        },
        required: ['id', 'username']
      }
    },
    required: ['id', 'content', 'createdAt', 'sender']
  })

  server.route({
    method: 'GET',
    url: '/',
    schema: {
      description: 'Get chat messages for specific date',
      tags: ['Message'],
      security: [{ BearerAuth: [] }],
      query: {
        type: 'object',
        properties: {
          chatId: {
            type: 'integer',
            minimum: 1
          },
          date: {
            type: 'string',
            format: 'date'
          }
        }
      },
      response: {
        200: {
          description: 'Messages',
          type: 'array',
          items: { $ref: 'Message' }
        },
        400: {
          description: 'Validation error',
          $ref: 'HttpError'
        },
        401: {
          description: 'Unauthorized',
          $ref: 'HttpError'
        }
      }
    },
    onRequest: [server.authenticate],
    handler: async (req, reply) => {
      const { chatId, date: dateString } = req.query
      const { id: userId } = req.user

      return await server.getMessages({
        chatId,
        date: new Date(dateString),
        userId
      })
    }
  })

  server.route({
    method: 'POST',
    url: '/',
    schema: {
      description: 'Send message to chat',
      tags: ['Message'],
      security: [{ BearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          chatId: {
            type: 'integer',
            minimum: 1
          },
          content: {
            type: 'string',
            minLength: 1,
            maxLength: 1024
          }
        }
      },
      response: {
        201: {
          description: 'Created message',
          $ref: 'Message'
        },
        401: {
          description: 'Unauthorized',
          $ref: 'HttpError'
        },
        404: {
          description: 'Chat not found',
          $ref: 'HttpError'
        }
      }
    },
    onRequest: [server.authenticate],
    handler: async (req, reply) => {
      const { chatId, content } = req.body
      const { id: userId } = req.user

      reply.code(201)
      return await server.sendMessage({ chatId, content, userId })
    }
  })
}
