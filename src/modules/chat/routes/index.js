export default async server => {
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
        maxLenght: 45
      },
      lastMessagePreview: {
        type: ['string', 'null'],
        maxLenght: 40
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
      return await server.getChats(req.user.id)
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
        maxLenght: 45
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
      const dto = {
        id: req.params.id,
        userId: req.user.id,
        userRole: req.user.role
      }

      return await server.getChatDetails(dto)
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
        200: {
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
      return await server.createChat(req.body)
    }
  })
}
