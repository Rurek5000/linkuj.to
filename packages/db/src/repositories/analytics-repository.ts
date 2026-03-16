import { prisma } from '../client'

export const analyticsRepository = {
  async trackClick(data: {
    shortCode: string
    ipHash: string
    country?: string
    userAgent?: string
  }) {
    return prisma.analyticsEvent.create({
      data,
    })
  },

  async getEventsForAggregation(startTime: Date, endTime: Date) {
    return prisma.analyticsEvent.findMany({
      where: {
        clickedAt: {
          gte: startTime,
          lt: endTime,
        },
      },
    })
  },

  async saveAggregated(data: {
    shortCode: string
    periodStart: Date
    periodEnd: Date
    periodType: string
    clickCount: number
    countriesJson: Record<string, number>
  }) {
    return prisma.analyticsAggregated.upsert({
      where: {
        shortCode_periodStart_periodType: {
          shortCode: data.shortCode,
          periodStart: data.periodStart,
          periodType: data.periodType,
        },
      },
      update: {
        clickCount: data.clickCount,
        countriesJson: data.countriesJson,
      },
      create: data,
    })
  },

  async getStats(shortCode: string, range: '24h' | '7d' | '30d' | 'all') {
    const now = new Date()
    let startDate = new Date(0)

    if (range === '24h') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    } else if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (range === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    return prisma.analyticsAggregated.findMany({
      where: {
        shortCode,
        periodStart: { gte: startDate },
      },
      orderBy: { periodStart: 'asc' },
    })
  },

  async deleteOldEvents() {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return prisma.analyticsEvent.deleteMany({
      where: {
        clickedAt: { lt: sevenDaysAgo },
      },
    })
  },
}