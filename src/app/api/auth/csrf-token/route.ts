import { NextResponse } from 'next/server'
import { RequireAuth } from '@/lib/auth'
import crypto from 'crypto'

export async function GET() {
  try {
    const AuthCheck = await RequireAuth()
    if (!AuthCheck.authenticated) {
      return AuthCheck.response
    }
    
    const _CSRFToken = crypto.randomBytes(32).toString('hex')
    
    const _Response = NextResponse.json({ csrfToken: _CSRFToken })
    
    _Response.cookies.set({
      name: 'csrf-token',
      value: _CSRFToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })
    
    return _Response
  } catch (Error) {
    console.error('Error generating CSRF token:', Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 