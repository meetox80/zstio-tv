import { PrismaClient } from "../generated/prisma"



const _GlobalForPrisma = global as unknown as {
  PrismaInstance: PrismaClient | undefined
}

let _PrismaInstance: PrismaClient

if (process.env.NODE_ENV === "production") {
  _PrismaInstance = new PrismaClient()
} else {
  if (!_GlobalForPrisma.PrismaInstance) {
    _GlobalForPrisma.PrismaInstance = new PrismaClient({
      log: ["error"]
    })
  }
  _PrismaInstance = _GlobalForPrisma.PrismaInstance
}

export const Prisma = _PrismaInstance 