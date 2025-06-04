import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/lib/prisma'
import { GenerateFingerprint } from '@/lib/client-fingerprint'

const _VoteRateLimitMap = new Map<string, number>()
const _VOTE_RATE_LIMIT_WINDOW = 5 * 1000

export async function POST(Request: NextRequest) {
  try {
    const Body = await Request.json()
    const { ProposalId, Vote, ClientId } = Body
    
    if (!ProposalId) {
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 })
    }
    
    const ForwardedFor = Request.headers.get('x-forwarded-for') || 'unknown'
    const IpAddress = ForwardedFor.split(',')[0].trim()
    const UserAgent = Request.headers.get('user-agent') || 'unknown'
    
    const Fingerprint = ClientId || GenerateFingerprint(IpAddress, UserAgent)
    
    const ApprovedSong = await Prisma.approvedSong.findUnique({
      where: { Id: ProposalId }
    })
    
    if (!ApprovedSong) {
      return NextResponse.json({ 
        error: 'Możesz głosować tylko na zatwierdzone piosenki',
        notApproved: true 
      }, { status: 400 })
    }
    
    const SongData = ApprovedSong
    const IsUpvote = Vote === true
    
    const ExistingVote = await Prisma.vote.findFirst({
      where: {
        ApprovedSongId: ProposalId,
        Fingerprint
      }
    })
    
    if (ExistingVote) {
      if (ExistingVote.IsUpvote === IsUpvote) {
        return NextResponse.json({ 
          error: 'Już oddałeś głos na tę piosenkę', 
          alreadyVoted: true 
        }, { status: 400 })
      }
      
      try {
        await Prisma.$transaction(async (Tx) => {
          const WasUpvote = ExistingVote.IsUpvote
          
          await Tx.vote.update({
            where: { Id: ExistingVote.Id },
            data: { IsUpvote }
          })
          
          const FetchedSongData = await Tx.approvedSong.findUnique({
            where: { Id: ProposalId },
            select: { Upvotes: true, Downvotes: true }
          })
          
          if (!FetchedSongData) {
            throw new Error(`ApprovedSong with ID ${ProposalId} not found during vote update.`)
          }
          
          if (WasUpvote && !IsUpvote) {
            await Tx.approvedSong.update({
              where: { Id: ProposalId },
              data: {
                Upvotes: FetchedSongData.Upvotes > 0 ? { decrement: 1 } : { set: 0 },
                Downvotes: { increment: 1 }
              }
            })
          } else if (!WasUpvote && IsUpvote) {
            await Tx.approvedSong.update({
              where: { Id: ProposalId },
              data: {
                Upvotes: { increment: 1 },
                Downvotes: FetchedSongData.Downvotes > 0 ? { decrement: 1 } : { set: 0 }
              }
            })
          }
        })
        
        const UpdatedSongAfterVoteChange = await Prisma.approvedSong.findUnique({ where: { Id: ProposalId } })
        
        return NextResponse.json({
          success: true,
          changed: true,
          song: {
            ...(UpdatedSongAfterVoteChange || SongData),
            UserVote: IsUpvote ? 'up' : 'down'
          }
        })
      } catch (Error) {
        console.error('Transaction error:', Error)
        return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 })
      }
    }
    
    const CurrentTime = Date.now()
    const LastVoteTime = _VoteRateLimitMap.get(Fingerprint)
    
    if (LastVoteTime && (CurrentTime - LastVoteTime) < _VOTE_RATE_LIMIT_WINDOW) {
      const RemainingTime = Math.ceil((_VOTE_RATE_LIMIT_WINDOW - (CurrentTime - LastVoteTime)) / 1000)
      return NextResponse.json({ 
        error: `Możesz zagłosować ponownie za ${RemainingTime} sekund`,
        rateLimited: true
      }, { status: 429 })
    }
    
    const VoteData = {
      Fingerprint,
      IsUpvote
    }
    
    try {
      await Prisma.$transaction(async (Tx) => {
        await Tx.vote.create({
          data: {
            ...VoteData,
            ApprovedSongId: ProposalId
          }
        })
        
        if (IsUpvote) {
          await Tx.approvedSong.update({
            where: { Id: ProposalId },
            data: { Upvotes: { increment: 1 } }
          })
        } else {
          await Tx.approvedSong.update({
            where: { Id: ProposalId },
            data: { Downvotes: { increment: 1 } }
          })
        }
      })
      
      _VoteRateLimitMap.set(Fingerprint, CurrentTime)
      
      if (_VoteRateLimitMap.size > 100) {
        const OldEntries: string[] = []
        _VoteRateLimitMap.forEach((Time, Key) => {
          if (CurrentTime - Time > _VOTE_RATE_LIMIT_WINDOW) {
            OldEntries.push(Key)
          }
        })
        OldEntries.forEach(Key => _VoteRateLimitMap.delete(Key))
      }
      
      try {
        const TodayFormatted = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '-')
        
        let DailyStats = await Prisma.statistics.findUnique({
          where: { Date: TodayFormatted }
        })
        
        if (!DailyStats) {
          DailyStats = await Prisma.statistics.create({
            data: {
              Date: TodayFormatted,
              SpotifyPlays: 0,
              SongRequests: 0
            }
          })
        }
        
        await Prisma.statistics.update({
          where: { Date: TodayFormatted },
          data: { SongRequests: { increment: 1 } }
        })
      } catch (StatError) {
        console.error('Failed to update song request statistics:', StatError)
      }
      
      const UpdatedSong = await Prisma.approvedSong.findUnique({ where: { Id: ProposalId } })
      
      return NextResponse.json({ 
        success: true,
        song: {
          ...UpdatedSong,
          UserVote: IsUpvote ? 'up' : 'down'
        }
      })
    } catch (Error) {
      console.error('Transaction error:', Error)
      
      const ErrorStr = String(Error)
      if (ErrorStr.includes('Unique constraint failed')) {
        return NextResponse.json({ 
          error: 'Już oddałeś głos na tę piosenkę', 
          alreadyVoted: true 
        }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to register vote' }, { status: 500 })
    }
  } catch (Error) {
    console.error('Error voting:', Error)
    return NextResponse.json({ 
      error: 'Failed to vote on song',
      details: process.env.NODE_ENV !== 'production' ? String(Error) : undefined
    }, { status: 500 })
  }
} 