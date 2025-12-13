import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Server-side only - credentials from environment
const ADMIN_PASSWORD = process.env.IMELIQ_ADMIN_PASSWORD || ''
const SESSION_SECRET = process.env.IMELIQ_SESSION_SECRET || 'fallback-secret-change-me'

// Simple session token generation
function generateSessionToken(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${random}-${Buffer.from(SESSION_SECRET).toString('base64').substring(0, 8)}`
}

// Validate session token
function isValidSession(token: string): boolean {
  if (!token) return false
  const parts = token.split('-')
  if (parts.length !== 3) return false

  // Check if token is not too old (24h)
  const timestamp = parseInt(parts[0], 36)
  const age = Date.now() - timestamp
  const maxAge = 24 * 60 * 60 * 1000 // 24 hours

  return age < maxAge
}

// Audit log function
async function auditLog(action: string, details: Record<string, unknown>, request: NextRequest) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    ...details
  }

  // Log to console (in production, send to logging service)
  console.log('[AUDIT]', JSON.stringify(logEntry))

  // TODO: In production, store in database or send to logging service
  // await supabase.from('audit_log').insert([logEntry])
}

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // Check if admin password is configured
    if (!ADMIN_PASSWORD) {
      console.error('[SECURITY] IMELIQ_ADMIN_PASSWORD not configured!')
      return NextResponse.json(
        { error: 'Admin not configured' },
        { status: 500 }
      )
    }

    // Validate password
    if (password !== ADMIN_PASSWORD) {
      await auditLog('LOGIN_FAILED', { reason: 'invalid_password' }, request)
      return NextResponse.json(
        { error: 'Vale parool' },
        { status: 401 }
      )
    }

    // Generate session token
    const sessionToken = generateSessionToken()

    // Set httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('imeliq_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    await auditLog('LOGIN_SUCCESS', {}, request)

    return NextResponse.json({
      success: true,
      message: 'Sisselogimine õnnestus'
    })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Autentimise viga' },
      { status: 500 }
    )
  }
}

// GET - Check session
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('imeliq_session')?.value

    if (!sessionToken || !isValidSession(sessionToken)) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ authenticated: true })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ authenticated: false })
  }
}

// DELETE - Logout
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('imeliq_session')

    await auditLog('LOGOUT', {}, request)

    return NextResponse.json({
      success: true,
      message: 'Välja logitud'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Väljalogimise viga' },
      { status: 500 }
    )
  }
}

