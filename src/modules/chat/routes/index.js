import chatServiceFactory from '../services/chat.service.js'

export default async server => {
  const chatService = chatServiceFactory(server)

  const rooms = new Map()

  server.route({
    method: 'GET',
    url: '/',
    schema: { security: [{ cookieAuth: [] }] },
    onRequest: [server.authenticate],
    handler: async (req, reply) => {
      const { id: userId, role: userRole } = req.user
      const chatPreviews = await chatService.getAll({ userId, userRole })

      return await reply.viewAsync('layouts/chats-page.eta', { chatPreviews })
    }
  })

  server.route({
    method: 'GET',
    url: '/:id',
    schema: {
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            minimum: 1
          }
        },
        required: ['id']
      }
    },
    onRequest: [server.authenticate],
    handler: async (req, reply) => {
      const { id } = req.params
      const { id: userId, role: userRole } = req.user

      const { title } = await chatService.get({ id, userId, userRole })

      const lastMessages = await chatService.getLastMessages({
        id,
        userId,
        count: 20
      })

      return await reply.viewAsync('layouts/chat-page.eta', {
        id,
        title,
        userId,
        lastMessages
      })
    }
  })

  server.route({
    method: 'GET',
    url: '/:id/join',
    schema: {
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            minimum: 1
          }
        },
        required: ['id']
      }
    },
    websocket: true,
    onRequest: [server.authenticate],
    handler: (socket, req) => {
      const { id } = req.params
      const userId = req.user.id

      if (!rooms.has(id)) {
        rooms.set(id, [])
      }

      const room = rooms.get(id)
      room.push(socket)

      socket.on('message', async data => {
        const message = await chatService.addMessage({
          id,
          content: data.toString(),
          userId
        })

        const senderView = await server.view('components/message-item.eta', {
          ...message,
          userId
        })
        const senderDto = JSON.stringify({
          action: 'ADD_MESSAGE',
          messageId: message.id,
          html: senderView
        })

        socket.send(senderDto)

        const receiverView = await server.view('components/message-item.eta', {
          ...message
        })
        const receiverDto = JSON.stringify({
          action: 'ADD_MESSAGE',
          messageId: message.id,
          html: receiverView
        })

        for (const member of room) {
          if (member !== socket) {
            member.send(receiverDto)
          }
        }
      })

      socket.on('close', () => {
        rooms.set(
          id,
          room.filter(s => s !== socket)
        )
      })
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
    method: 'POST',
    url: '/',
    schema: {
      description: 'Create new chat',
      tags: ['Chat'],
      security: [{ cookieAuth: [] }],
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
}
