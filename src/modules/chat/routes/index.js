import {
  MESSAGE_PREVIEW_LEN,
  default as chatServiceFactory
} from '../services/chat.service.js'

export default async server => {
  const chatService = chatServiceFactory(server)

  server.addSchema({
    $id: 'ChatPreview',
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        minimum: 1
      },
      title: {
        type: 'string',
        maxLength: 45
      },
      lastMessagePreview: {
        type: ['string', 'null'],
        maxLength: MESSAGE_PREVIEW_LEN
      }
    },
    required: ['id', 'title', 'lastMessagePreview']
  })

  server.route({
    method: 'GET',
    url: '/',
    schema: {
      description: 'Get chats',
      tags: ['Chat'],
      security: [{ BearerAuth: [] }],
      response: {
        200: {
          description: 'Chat previews',
          type: 'array',
          items: { $ref: 'ChatPreview' }
        },
        401: {
          description: 'Unauthorized',
          $ref: 'HttpError'
        }
      }
    },
    onRequest: [server.authenticate],
    handler: async (req, reply) => {
      const { id: userId, role: userRole } = req.user
      return await chatService.getAll({ userId, userRole })
    }
  })

  server.addSchema({
    $id: 'ChatDetails',
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        minimum: 1
      },
      title: {
        type: 'string',
        maxLength: 45
      },
      members: {
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
            }
          },
          required: ['id', 'username']
        }
      }
    },
    required: ['id', 'title', 'members']
  })

  server.route({
    method: 'GET',
    url: '/:id',
    schema: {
      description: 'Get chat details',
      tags: ['Chat'],
      security: [{ BearerAuth: [] }],
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
          description: 'Chat details',
          $ref: 'ChatDetails'
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
      const { id: userId, role: userRole } = req.user
      return await chatService.get({
        id: req.params.id,
        userId,
        userRole
      })
    }
  })

  server.route({
    method: 'POST',
    url: '/',
    schema: {
      description: 'Create new chat',
      tags: ['Chat'],
      security: [{ BearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 3,
            maxLength: 45
          },
          members: {
            type: 'array',
            items: {
              type: 'integer',
              minimum: 1
            },
            minItems: 2
          }
        },
        required: ['title', 'members']
      },
      response: {
        201: {
          description: 'Chat details',
          $ref: 'ChatDetails'
        },
        400: {
          description: 'Validation error',
          $ref: 'HttpError'
        },
        401: {
          description: 'Unauthorized',
          $ref: 'HttpError'
        },
        403: {
          description: 'Forbidden',
          $ref: 'HttpError'
        }
      }
    },
    onRequest: [server.authenticate, server.authorize('ADMIN')],
    handler: async (req, reply) => {
      const { title, members } = req.body

      reply.code(201)
      return await chatService.create({ title, members })
    }
  })

  server.addSchema({
    $id: 'ChatMessage',
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
    url: '/:id/messages',
    schema: {
      description: 'Get chat messages for specific period',
      tags: ['Chat'],
      security: [{ BearerAuth: [] }],
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
      query: {
        type: 'object',
        properties: {
          fromDate: {
            type: 'string',
            format: 'date'
          },
          toDate: {
            type: 'string',
            format: 'date'
          }
        },
        required: ['fromDate', 'toDate']
      },
      response: {
        200: {
          description: 'Messages',
          type: 'array',
          items: { $ref: 'ChatMessage' }
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
      const { id } = req.params
      const { fromDate: fromDateStr, toDate: toDateStr } = req.query
      const { id: userId } = req.user

      return await chatService.getMessages({
        id,
        fromDateStr,
        toDateStr,
        userId
      })
    }
  })

  server.route({
    method: 'POST',
    url: '/:id/messages',
    schema: {
      description: 'Send message to chat',
      tags: ['Chat'],
      security: [{ BearerAuth: [] }],
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
      body: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            minLength: 1,
            maxLength: 1024
          }
        },
        required: ['content']
      },
      response: {
        201: {
          description: 'Created message',
          $ref: 'ChatMessage'
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
      const { id } = req.params
      const { content } = req.body
      const { id: userId } = req.user

      reply.code(201)
      return await chatService.sendMessage({ id, content, userId })
    }
  })
}
