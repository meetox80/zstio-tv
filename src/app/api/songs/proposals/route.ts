import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/lib/prisma'
import { GenerateFingerprint } from '@/lib/client-fingerprint'

export async function GET(Request: NextRequest) {
  try {
    const PageParam = Request.nextUrl.searchParams.get('page')
    const LimitParam = Request.nextUrl.searchParams.get('limit')
    const ClientIdParam = Request.nextUrl.searchParams.get('clientId')
    const PendingParam = Request.nextUrl.searchParams.get('pending')
    
    const ShowPending = PendingParam !== 'false'
    const Page = PageParam ? parseInt(PageParam, 10) : 1
    const Limit = LimitParam ? parseInt(LimitParam, 10) : 10
    const Skip = (Page - 1) * Limit
    
    const ForwardedFor = Request.headers.get('x-forwarded-for') || 'unknown'
    const IpAddress = ForwardedFor.split(',')[0].trim()
    const UserAgent = Request.headers.get('user-agent') || 'unknown'
    
    const Fingerprint = ClientIdParam || GenerateFingerprint(IpAddress, UserAgent)
    
    if (ShowPending) {
      try {
        const Proposals = await Prisma.songProposal.findMany({
          take: Limit,
          skip: Skip,
          orderBy: {
            CreatedAt: 'desc'
          }
        })
        
        const Total = await Prisma.songProposal.count()
        
        return NextResponse.json({
          proposals: Proposals,
          pagination: {
            total: Total,
            page: Page,
            limit: Limit,
            pages: Math.ceil(Total / Limit)
          },
          fingerprint: Fingerprint
        })
      } catch (Error) {
        console.error('Error fetching pending proposals:', Error)
        return NextResponse.json({ error: 'Failed to fetch pending proposals' }, { status: 500 })
      }
    } else {
      try {
        const ApprovedSongs = await Prisma.approvedSong.findMany({
          take: Limit,
          skip: Skip,
          orderBy: {
            CreatedAt: 'desc'
          },
          include: {
            Votes: {
              where: {
                Fingerprint
              },
              select: {
                IsUpvote: true
              }
            }
          }
        })
        
        const Total = await Prisma.approvedSong.count()
        
        const FormattedApprovedSongs = ApprovedSongs.map(Song => ({
          ...Song,
          UserVote: Song.Votes.length > 0 
            ? (Song.Votes[0].IsUpvote ? 'up' : 'down') 
            : null,
          Votes: undefined
        }))
        
        return NextResponse.json({
          proposals: FormattedApprovedSongs,
          pagination: {
            total: Total,
            page: Page,
            limit: Limit,
            pages: Math.ceil(Total / Limit)
          },
          fingerprint: Fingerprint
        })
      } catch (Error) {
        console.error('Error fetching approved songs:', Error)
        return NextResponse.json({ error: 'Failed to fetch approved songs' }, { status: 500 })
      }
    }
  } catch (Error) {
    console.error('Error fetching songs:', Error)
    return NextResponse.json({ 
      error: 'Failed to fetch songs',
      details: process.env.NODE_ENV !== 'production' ? String(Error) : undefined
    }, { status: 500 })
  }
} 