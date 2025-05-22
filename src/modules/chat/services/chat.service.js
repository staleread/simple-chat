import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import userServiceFactory from '../../user/services/user.service.js'

dayjs.extend(relativeTime)

export const MESSAGE_PREVIEW_LEN = 35
const ELLIPSIS = '...'

const toMessagePreview = content => {
  if (!content) {
    return 'No messages yet'
  }
  if (content.length < MESSAGE_PREVIEW_LEN) {
    return content
  }
  return content.substring(0, MESSAGE_PREVIEW_LEN - ELLIPSIS.length) + ELLIPSIS
}

const toMessageDto = rawMessage => ({
  ...rawMessage,
  relativeToNow: dayjs().to(rawMessage.createdAt)
})

export default server => {
  const userService = userServiceFactory(server)

  const checkChatAccess = async (chatId, userId) => {
    const chat = await server.prisma.chat.findFirst({
      where: {
        id: chatId,
        members: { some: { id: userId } }
      },
      select: { id: true }
    })

    if (!chat) {
      throw server.httpErrors.forbidden('Chat access is forbidden')
    }
  }

  return {
    getAll: async ({ userId }) => {
      const userChats = await server.prisma.chat.findMany({
        where: { members: { some: { id: userId } } },
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

      const lastMessagePreview = toMessagePreview(
        chat.messages[0]?.content ?? 'No messages yet'
      )

      return userChats.map(chat => ({
        id: chat.id,
        title: chat.title,
        lastMessagePreview
      }))
    },
    get: async ({ id, userId, userRole }) => {
      const where = { id }

      if (userRole !== 'ADMIN') {
        where.members = { some: { id: userId } }
      }

      const chatDetails = await server.prisma.chat.findFirst({
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
      const allMembersExist = await userService.exist(...members)

      if (!allMembersExist) {
        throw server.httpErrors.notFound('Some members are not found')
      }

      return await server.prisma.chat.create({
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
    },
    getMessages: async ({ id, userId, after, before }) => {
      const createdAt = {
        gte: new Date(after)
      }

      if (before) createdAt.lt = new Date(before)

      await checkChatAccess(id, userId)

      const rawMessages = await server.prisma.message.findMany({
        where: {
          chat: { id },
          createdAt
        },
        orderBy: {
          createdAt: 'desc'
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

      return rawMessages.map(toMessageDto).reverse()
    },
    getLastMessages: async ({ id, userId, count }) => {
      await checkChatAccess(id, userId)

      const rawMessages = await server.prisma.message.findMany({
        take: count,
        where: { chat: { id } },
        orderBy: {
          createdAt: 'desc'
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

      return rawMessages.map(toMessageDto).reverse()
    },
    addMessage: async ({ id, content, userId }) => {
      await checkChatAccess(id, userId)

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

      return toMessageDto(message)
    }
  }
}
