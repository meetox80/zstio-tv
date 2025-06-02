import { Prisma } from './prisma'
import type { User } from '../generated/prisma'
import bcrypt from 'bcrypt'

export async function GetUserByName(Name: string): Promise<User | null> {
  return await Prisma.user.findUnique({
    where: {
      name: Name
    }
  })
}

export async function GetUserById(Id: string): Promise<User | null> {
  return await Prisma.user.findUnique({
    where: {
      id: Id
    }
  })
}

export async function CreateUser(Name: string, Password: string): Promise<void> {
  const _HashedPassword = await bcrypt.hash(Password, 12)
  await Prisma.user.create({
    data: {
      name: Name,
      password: _HashedPassword,
      permissions: 0
    }
  })
} 