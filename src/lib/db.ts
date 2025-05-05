import { Prisma } from './prisma'
import type { User } from '../generated/prisma'

export async function GetUserByUsername(Username: string): Promise<User | null> {
  return await Prisma.user.findUnique({
    where: {
      username: Username
    }
  })
}

export async function CreateUser(Username: string, Password: string): Promise<void> {
  await Prisma.user.create({
    data: {
      username: Username,
      password: Password
    }
  })
} 