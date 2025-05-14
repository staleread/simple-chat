export default async server => {
  const messages = server.prisma.message

  const addDays = (date, days) => {
    const resultDate = new Date(date)
    date.setDate(resultDate.getDate() + days)

    return resultDate
  }

  server.decorate('getMessages', async ({ chatId, date, userId }) => {
    if (date > new Date()) {
      throw server.httpErrors.badRequest('Invalid date')
    }

    const canUserAccessChat = await server.prisma.chat.findFirst({
      where: {
        id: chatId,
        members: {
          some: { id: userId }
        }
      },
      select: { id: true }
    })

    if (!canUserAccessChat) {
      throw server.httpErrors.notFound('Chat not found')
    }

    const rawMessages = await messages.findMany({
      where: {
        chat: { id: chatId },
        createdAt: {
          gte: date,
          lt: addDays(date, 1)
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    return rawMessages.map(message => ({
      ...message,
      createdAt: message.createdAt.toJSON()
    }))
  })

  server.decorate('sendMessage', async ({ chatId, content, userId }) => {
    const canUserAccessChat = await server.prisma.chat.findFirst({
      where: {
        id: chatId,
        members: {
          some: { id: userId }
        }
      },
      select: { id: true }
    })

    if (!canUserAccessChat) {
      throw server.httpErrors.notFound('Chat not found')
    }

    const message = await messages.create({
      data: {
        content,
        chat: { connect: { id: chatId } },
        sender: { connect: { id: userId } }
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    return {
      ...message,
      createdAt: message.createdAt.toJSON()
    }
  })
}
