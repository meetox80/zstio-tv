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

    console.log("Rejecting song - User permissions check:", {
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
    
    let DeletedFromApproved = false
    try {
      await Prisma.approvedSong.delete({
        where: { Id: SongId }
      })
      DeletedFromApproved = true
    } catch (Error: any) {
      // P2025 is Prisma's error code for "Record to delete not found"
      if (Error.code !== 'P2025') {
        // If it's a different error, rethrow it
        console.error('Error deleting from approved songs:', Error)
        throw new Error('Nie udało się usunąć zatwierdzonej piosenki')
      }
      // If not found in approved, we'll try proposals next, so continue
    }

    if (!DeletedFromApproved) {
      try {
        await Prisma.songProposal.delete({
          where: { Id: SongId }
        })
      } catch (Error: any) {
        // P2025 is Prisma's error code for "Record to delete not found"
        if (Error.code === 'P2025') {
          return NextResponse.json({ 
            error: 'Piosenka nie została znaleziona ani w zatwierdzonych, ani w propozycjach',
            details: { songId: SongId }
          }, { status: 404 })
        } else {
          console.error('Error deleting from song proposals:', Error)
          throw new Error('Nie udało się usunąć propozycji piosenki')
        }
      }
    }
    
    return NextResponse.json({ 
      success: true,
      deletedFrom: DeletedFromApproved ? 'approvedSongs' : 'songProposals'
    })
  } catch (Error: any) {
    console.error('Error rejecting/deleting song:', Error)
    return NextResponse.json({ 
      error: Error.message || 'Nie udało się odrzucić/usunąć piosenki',
      errorDetails: Error.message || String(Error)
    }, { status: 500 })
  }
} 