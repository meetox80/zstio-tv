import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/lib/prisma'
import { RequireAuth } from '@/lib/auth'

export async function POST(Request: NextRequest) {
  try {
    const AuthCheck = await RequireAuth()
    if (!AuthCheck.authenticated) {
      return AuthCheck.response
    }
    
    const Body = await Request.json()
    const { SongId } = Body
    
    if (!SongId) {
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 })
    }
    
    const Song = await Prisma.songProposal.findUnique({
      where: { Id: SongId }
    })
    
    if (!Song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }
    
    await Prisma.songProposal.delete({
      where: { Id: SongId }
    })
    
    return NextResponse.json({ success: true })
  } catch (Error) {
    console.error('Error rejecting song:', Error)
    return NextResponse.json({ error: 'Failed to reject song' }, { status: 500 })
  }
} 