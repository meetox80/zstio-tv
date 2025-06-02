import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/lib/prisma'
import { GenerateFingerprint } from '@/lib/client-fingerprint'
import { RateLimit } from '@/lib/rate-limit'
import { ValidateInput, TrackSchema } from '@/lib/validation'

const _RATE_LIMIT_WINDOW = 60 * 1000
const _TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const _TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY

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
    
    // Add a development mode check to bypass Turnstile verification
    const IsDevelopment = process.env.NODE_ENV === 'development'
    
    if (_TURNSTILE_SECRET_KEY) {
      const FormData = new URLSearchParams()
      FormData.append('secret', _TURNSTILE_SECRET_KEY)
      FormData.append('response', Token)
      FormData.append('remoteip', IpAddress)
      
      try {
        const TurnstileResponse = await fetch(_TURNSTILE_VERIFY_URL, {
          method: 'POST',
          body: FormData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        
        const TurnstileResult = await TurnstileResponse.json()
        console.log('Turnstile verification result:', TurnstileResult)
        
        if (!TurnstileResult.success && !IsDevelopment) {
          console.error('CAPTCHA verification failed:', TurnstileResult['error-codes'])
          return NextResponse.json({ 
            error: 'CAPTCHA verification failed', 
            captchaFailed: true,
            details: TurnstileResult['error-codes'] 
          }, { status: 400 })
        }
      } catch (Error) {
        console.error('Error during Turnstile verification:', Error)
        if (!IsDevelopment) {
          return NextResponse.json({ 
            error: 'Error during CAPTCHA verification', 
            captchaFailed: true 
          }, { status: 500 })
        }
      }
    } else if (!IsDevelopment) {
      console.error('TURNSTILE_SECRET_KEY is not defined in environment variables')
      return NextResponse.json({
        error: 'Server configuration error',
        captchaFailed: true
      }, { status: 500 })
    } else {
      console.log('WARNING: Bypassing CAPTCHA verification in development')
    }
    
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