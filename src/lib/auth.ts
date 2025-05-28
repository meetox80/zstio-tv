import CredentialsProvider from 'next-auth/providers/credentials'
import { GetUserByUsername } from './db'
import bcrypt from 'bcrypt'
import type { NextAuthOptions } from 'next-auth'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        
        const User = await GetUserByUsername(credentials.username)
        if (!User) return null
        
        const PasswordMatch = await bcrypt.compare(credentials.password, User.password)
        if (!PasswordMatch) return null
        
        return {
          id: User.id.toString(),
          name: User.username
        }
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  }
}

export async function RequireAuth() {
  const Session = await getServerSession(authOptions)
  
  if (!Session || !Session.user) {
    return {
      authenticated: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  
  return {
    authenticated: true,
    session: Session
  }
} 