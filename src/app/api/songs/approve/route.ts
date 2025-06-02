import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/lib/prisma'
import { RequireAuth } from '@/lib/auth'
import { HasPermission } from '@/lib/permissions'

const SONG_REQUESTS_MANAGE = 16

export async function POST(Request: NextRequest) {
  try {
    const AuthCheck = await RequireAuth()
    if (!AuthCheck.authenticated || !AuthCheck.session?.user?.name) {
      return AuthCheck.response || NextResponse.json({ error: 'Wymagane uwierzytelnienie' }, { status: 401 })
    }

    const CurrentUser = await Prisma.user.findUnique({
      where: { name: AuthCheck.session.user.name as string }
    })

    if (!CurrentUser) {
      return NextResponse.json({ error: 'Użytkownik nie znaleziony' }, { status: 404 })
    }

    console.log("Approving song - User permissions check:", {
      username: CurrentUser.name,
      userPermissions: CurrentUser.permissions,
      requiredPermission: SONG_REQUESTS_MANAGE,
      hasPermission: HasPermission(CurrentUser.permissions, SONG_REQUESTS_MANAGE),
      permissionCheckResult: (CurrentUser.permissions & SONG_REQUESTS_MANAGE) === SONG_REQUESTS_MANAGE
    })

    if (!HasPermission(CurrentUser.permissions, SONG_REQUESTS_MANAGE)) {
      return NextResponse.json({ 
        error: 'Nie masz wystarczających uprawnień do zarządzania propozycjami piosenek',
        permissionDetails: {
          required: SONG_REQUESTS_MANAGE,
          userValue: CurrentUser.permissions
        }
      }, { status: 403 })
    }
    
    const Body = await Request.json()
    const { SongId } = Body
    
    if (!SongId) {
      return NextResponse.json({ error: 'ID piosenki jest wymagane' }, { status: 400 })
    }
    
    const Song = await Prisma.songProposal.findUnique({
      where: { Id: SongId },
      include: {
        Votes: true
      }
    })
    
    if (!Song) {
      return NextResponse.json({ error: 'Piosenka nie została znaleziona w propozycjach' }, { status: 404 })
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
  } catch (Error: any) {
    console.error('Error approving song:', Error)
    return NextResponse.json({ 
      error: 'Nie udało się zatwierdzić piosenki',
      errorDetails: Error.message || String(Error)
    }, { status: 500 })
  }
}