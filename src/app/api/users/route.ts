import { NextRequest, NextResponse } from 'next/server'
import { Permission } from '@/types/permissions'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@/lib/prisma'
import { HasPermission } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  try {
    const _Session = await getServerSession(authOptions)
    
    if (!_Session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const _CurrentUser = await Prisma.user.findUnique({
      where: { name: _Session.user.name as string }
    })
    
    if (!_CurrentUser || !HasPermission(_CurrentUser.permissions, Permission.USERS_VIEW)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const _Users = await Prisma.user.findMany({
      select: {
        id: true,
        name: true,
        permissions: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(_Users)
  } catch (_Error) {
    console.error('Error fetching users:', _Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const _Session = await getServerSession(authOptions)
    
    if (!_Session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const _CurrentUser = await Prisma.user.findUnique({
      where: { name: _Session.user.name as string }
    })
    
    if (!_CurrentUser || !HasPermission(_CurrentUser.permissions, Permission.USERS_MANAGE)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const _Body = await req.json()
    
    if (!_Body.name || typeof _Body.name !== 'string' || _Body.name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    
    if (!_Body.password || typeof _Body.password !== 'string' || _Body.password.trim() === '') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }
    
    // Prevent creating users with the name 'admin'
    if (_Body.name.toLowerCase() === 'admin') {
      return NextResponse.json({ error: 'Cannot use reserved username' }, { status: 400 })
    }
    
    const _ExistingUser = await Prisma.user.findUnique({
      where: { name: _Body.name }
    })
    
    if (_ExistingUser) {
      return NextResponse.json({ error: 'User with this name already exists' }, { status: 409 })
    }
    
    const _HashedPassword = await import('bcrypt').then(mod => mod.default.hash(_Body.password, 12))
    
    const _NewUser = await Prisma.user.create({
      data: {
        name: _Body.name,
        permissions: 0,
        password: _HashedPassword
      }
    })
    
    return NextResponse.json(_NewUser, { status: 201 })
  } catch (_Error) {
    console.error('Error creating user:', _Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 