export { prisma } from './client'
export { linkRepository } from './repositories/link.repository'
export { analyticsRepository } from './repositories/analytics-repository'

export type { Link, AnalyticsEvent, AnalyticsAggregated } from '@prisma/client'