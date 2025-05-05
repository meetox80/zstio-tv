import { PrismaClient } from '../generated/prisma'

const GlobalForPrisma = global as unknown as { Prisma: PrismaClient }

export const Prisma = GlobalForPrisma.Prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') GlobalForPrisma.Prisma = Prisma 