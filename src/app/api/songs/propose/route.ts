import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/lib/prisma'
import { GenerateFingerprint } from '@/lib/client-fingerprint'
import { RateLimit } from '@/lib/rate-limit'
import { ValidateInput, TrackSchema } from '@/lib/validation'

const _RATE_LIMIT_WINDOW = 60 * 1000

export async function POST(Request: NextRequest) {
  try {
    const Body = await Request.json()
    const { Track, ClientId, Token } = Body
    
    const Validation = ValidateInput(Track || {}, TrackSchema)
    if (!Validation.Valid) {
      return NextResponse.json({ 
        error: 'Invalid track data', 
        validationErrors: Validation.Errors 
      }, { status: 400 })
    }
    
    if (!Token) {
      return NextResponse.json({ 
        error: 'CAPTCHA verification required', 
        captchaFailed: true 
      }, { status: 400 })
    }
    
    const ForwardedFor = Request.headers.get('x-forwarded-for') || 'unknown'
    const IpAddress = ForwardedFor.split(',')[0].trim()
    const UserAgent = Request.headers.get('user-agent') || 'unknown'
    
    const Fingerprint = ClientId || GenerateFingerprint(IpAddress, UserAgent)
    
    const RateLimitResult = await RateLimit(`song-propose:${Fingerprint}`, _RATE_LIMIT_WINDOW)
    
    if (!RateLimitResult.Success) {
      return NextResponse.json({ 
        error: `Możesz wysłać kolejną propozycję za ${RateLimitResult.RemainingTime} sekund`,
        rateLimited: true
      }, { status: 429 })
    }
    
    const ExistingSong = await Prisma.songProposal.findFirst({
      where: {
        TrackId: Track.Id
      }
    })
    
    if (ExistingSong) {
      return NextResponse.json({ 
        error: 'Ta piosenka została już zaproponowana',
        alreadyExists: true
      }, { status: 400 })
    }
    
    const ApprovedSong = await Prisma.approvedSong.findFirst({
      where: {
        TrackId: Track.Id
      }
    })
    
    if (ApprovedSong) {
      return NextResponse.json({ 
        error: 'Ta piosenka została już zatwierdzona',
        alreadyApproved: true
      }, { status: 400 })
    }
    
    const ProposedSong = await Prisma.songProposal.create({
      data: {
        TrackId: Track.Id,
        Title: Track.Title,
        Artist: Track.Artist,
        Album: Track.Album || '',
        AlbumArt: Track.AlbumArt || '',
        Duration: Track.Duration || 0,
        Uri: Track.Uri || '',
        Fingerprint
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      song: ProposedSong,
      fingerprint: Fingerprint
    })
  } catch (Error) {
    console.error('Error proposing song:', Error)
    return NextResponse.json({ error: 'Failed to propose song' }, { status: 500 })
  }
} 