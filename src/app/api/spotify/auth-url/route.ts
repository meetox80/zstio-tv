import { NextResponse } from 'next/server'
import { GetAuthUrl } from '@/lib/spotify.server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@/lib/prisma'
import { HasPermission } from '@/lib/permissions'
import { Permission } from '@/types/permissions'

export async function GET() {
  try {
    const _Session = await getServerSession(authOptions)

    if (!_Session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const _CurrentUser = await Prisma.user.findUnique({
      where: { name: _Session.user.name as string }
    })

    if (!_CurrentUser || !(HasPermission(_CurrentUser.permissions, Permission.SPOTIFY_AUTH) || HasPermission(_CurrentUser.permissions, Permission.ADMINISTRATOR))) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const AuthUrl = GetAuthUrl()
    return NextResponse.json({ authUrl: AuthUrl })
  } catch (error) {
    console.error('Error generating auth URL:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 