export default async server => {
  const MESSAGE_PREVIEW_LEN = 35
  const chats = server.prisma.chat

  const toMessagePreview = content => {
    if (content.lenght < MESSAGE_PREVIEW_LEN) {
      return content
    }
    return `${content.substring(0, MESSAGE_PREVIEW_LEN - 3)}...`
  }

  server.decorate('getChats', async ({ userId, userRole }) => {
    const where = {}

    if (userRole !== 'ADMIN') {
      where.members = { some: { id: userId } }
    }

    const userChats = await chats.findMany({
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
  })

  server.decorate('getChatDetails', async ({ id, userId, userRole }) => {
    const where = { id }

    if (userRole !== 'ADMIN') {
      where.members = { some: { id: userId } }
    }

    const chatDetails = await chats.findUnique({
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
  })

  server.decorate('createChat', async dto => {
    const [err, chatDetails] = await server.to(
      chats.create({
        data: {
          title: dto.title,
          members: {
            connect: dto.members.map(id => ({ id }))
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

    if (err) {
      throw server.httpErrors.notFound('Some members are not found')
    }

    return chatDetails
  })
}
