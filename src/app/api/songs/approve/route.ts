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
      where: { Id: SongId },
      include: {
        Votes: true
      }
    })
    
    if (!Song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }
    
    const ApprovedSong = await Prisma.approvedSong.create({
      data: {
        TrackId: Song.TrackId,
        Title: Song.Title,
        Artist: Song.Artist,
        Album: Song.Album,
        AlbumArt: Song.AlbumArt,
        Duration: Song.Duration,
        Uri: Song.Uri,
        Upvotes: Song.Votes.filter((v: { IsUpvote: boolean }) => v.IsUpvote).length,
        Downvotes: Song.Votes.filter((v: { IsUpvote: boolean }) => !v.IsUpvote).length
      }
    })
    
    if (Song.Votes.length > 0) {
      await Promise.all(Song.Votes.map((Vote: { Fingerprint: string; IsUpvote: boolean }) => 
        Prisma.vote.create({
          data: {
            ApprovedSongId: ApprovedSong.Id,
            Fingerprint: Vote.Fingerprint,
            IsUpvote: Vote.IsUpvote
          }
        })
      ))
    }
    
    await Prisma.songProposal.delete({
      where: { Id: SongId }
    })
    
    return NextResponse.json({ 
      success: true, 
      song: ApprovedSong
    })
  } catch (Error) {
    console.error('Error approving song:', Error)
    return NextResponse.json({ error: 'Failed to approve song' }, { status: 500 })
  }
} 