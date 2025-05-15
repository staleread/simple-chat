const MESSAGE_PREVIEW_LEN = 35

const toMessagePreview = content => {
  if (content.lenght < MESSAGE_PREVIEW_LEN) {
    return content
  }
  return `${content.substring(0, MESSAGE_PREVIEW_LEN - 3)}...`
}

const addDays = (date, days) => {
  const resultDate = new Date(date)
  resultDate.setDate(resultDate.getDate() + days)

  return resultDate
}

export default server => ({
  getAll: async ({ userId, userRole }) => {
    const where = {}

    if (userRole !== 'ADMIN') {
      where.members = { some: { id: userId } }
    }

    const userChats = await server.prisma.chat.findMany({
      where,
      select: {
        id: true,
        title: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            content: true
          }
        }
      }
    })

    return userChats.map(chat => ({
      id: chat.id,
      title: chat.title,
      lastMessagePreview: chat.messages.length
        ? toMessagePreview(chat.messages[0].content)
        : null
    }))
  },
  get: async ({ id, userId, userRole }) => {
    const where = { id }

    if (userRole !== 'ADMIN') {
      where.members = { some: { id: userId } }
    }

    const chatDetails = await server.prisma.chat.findUnique({
      where,
      select: {
        id: true,
        title: true,
        members: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    if (!chatDetails) {
      throw server.httpErrors.notFound('Chat not found')
    }

    return chatDetails
  },
  create: async ({ title, members }) => {
    const [err, chatDetails] = await server.to(
      server.prisma.chat.create({
        data: {
          title: title,
          members: {
            connect: members.map(id => ({ id }))
          }
        },
        select: {
          id: true,
          title: true,
          members: {
            select: {
              id: true,
              username: true
            }
          }
        }
      })
    )

    if (err) throw server.httpErrors.notFound('Some members are not found')

    return chatDetails
  },
  getMessages: async ({ id, fromDateStr, toDateStr, userId }) => {
    const fromDate = new Date(fromDateStr)
    const toDate = addDays(new Date(toDateStr), 1)

    if (fromDate > toDate) {
      throw server.httpErrors.badRequest('Invalid date range')
    }

    server.log.warn(fromDate + " " + toDate)

    const canUserAccessChat = await server.prisma.chat.findFirst({
      where: {
        id,
        members: { some: { id: userId } }
      },
      select: { id: true }
    })

    if (!canUserAccessChat) {
      throw server.httpErrors.notFound('Chat not found')
    }

    const rawMessages = await server.prisma.message.findMany({
      where: {
        chat: { id },
        createdAt: {
          gte: fromDate,
          lt: toDate
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
  },
  sendMessage: async ({ id, content, userId }) => {
    const canUserAccessChat = await server.prisma.chat.findFirst({
      where: {
        id,
        members: { some: { id: userId } }
      },
      select: { id: true }
    })

    if (!canUserAccessChat) {
      throw server.httpErrors.notFound('Chat not found')
    }

    const message = await server.prisma.message.create({
      data: {
        content,
        chat: { connect: { id } },
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
  }
})
