import { Prisma } from './prisma'
import type { User } from '../generated/prisma'
import bcrypt from 'bcrypt'

export async function GetUserByUsername(Username: string): Promise<User | null> {
  return await Prisma.user.findUnique({
    where: {
      username: Username
    }
  })
}

export async function CreateUser(Username: string, Password: string): Promise<void> {
  const _HashedPassword = await bcrypt.hash(Password, 12)
  await Prisma.user.create({
    data: {
      username: Username,
      password: _HashedPassword
    }
  })
} 