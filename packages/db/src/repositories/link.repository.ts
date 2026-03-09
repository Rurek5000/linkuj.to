import { prisma } from '../client'

export const linkRepository = {
  async create(shortCode: string, originalUrl: string) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    return prisma.link.create({
      data: {
        shortCode,
        originalUrl,
        expiresAt,
      },
    })
  },

  async findByShortCode(shortCode: string) {
    return prisma.link.findUnique({
      where: { shortCode },
    })
  },

  async softDelete(shortCode: string) {
    return prisma.link.update({
      where: { shortCode },
      data: { isActive: false },
    })
  },

  async findExpired() {
    return prisma.link.findMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true,
      },
    })
  },
}