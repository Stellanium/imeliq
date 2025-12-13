import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Lazy-init supabase client
let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\n/g, '')
    const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim().replace(/\n/g, '')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabase = createClient(supabaseUrl, supabaseKey)
  }
  return supabase
}

// Session validation (same logic as auth route)
const SESSION_SECRET = process.env.IMELIQ_SESSION_SECRET || 'fallback-secret-change-me'

function isValidSession(token: string): boolean {
  if (!token) return false
  const parts = token.split('-')
  if (parts.length !== 3) return false

  const timestamp = parseInt(parts[0], 36)
  const age = Date.now() - timestamp
  const maxAge = 24 * 60 * 60 * 1000

  return age < maxAge
}

// Audit logging
async function auditLog(action: string, details: Record<string, unknown>, request: NextRequest) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    ...details
  }
  console.log('[AUDIT]', JSON.stringify(logEntry))
}

// Check admin session from cookie
async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('imeliq_session')?.value
    return sessionToken ? isValidSession(sessionToken) : false
  } catch {
    return false
  }
}

// POST - register new tester (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, family_name, email, phone, marketing_consent, locale } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Nimi ja email on kohustuslikud' }, { status: 400 })
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Vigane emaili aadress' }, { status: 400 })
    }

    const { data, error } = await getSupabase()
      .from('testers')
      .insert([{
        name,
        family_name: family_name || null,
        email,
        phone: phone || null,
        marketing_consent: marketing_consent || false,
        locale: locale || 'et'
      }])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'See email on juba registreeritud' }, { status: 409 })
      }
      throw error
    }

    // GDPR: Log data collection
    await auditLog('TESTER_REGISTERED', {
      email_hash: Buffer.from(email).toString('base64').substring(0, 8),
      marketing_consent
    }, request)

    return NextResponse.json({
      success: true,
      message: 'Registreerimine õnnestus!',
      data: data[0]
    })

  } catch (error: unknown) {
    console.error('Registration error:', error)
    let errorMessage = 'Viga registreerimisel'
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// GET - Admin data access (requires session)
export async function GET(request: NextRequest) {
  // Check session cookie
  const isAuthenticated = await checkAdminSession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'
  const format = searchParams.get('format') || 'json'

  // GDPR: Log data access
  await auditLog('DATA_ACCESS', { type, format }, request)

  try {
    const result: Record<string, unknown> = {}

    if (type === 'all' || type === 'feedback') {
      const { data: feedback, error } = await getSupabase()
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      result.feedback = feedback
    }

    if (type === 'all' || type === 'orders') {
      const { data: orders, error } = await getSupabase()
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      result.orders = orders
    }

    if (type === 'all' || type === 'testers') {
      const { data: testers, error } = await getSupabase()
        .from('testers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      result.testers = testers
    }

    if (type === 'all' || type === 'stats') {
      const { data: stats, error } = await getSupabase()
        .from('feedback_stats')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      result.stats = stats || {
        total_feedback: 0,
        positive_count: 0,
        negative_count: 0,
        neutral_count: 0
      }
    }

    // CSV export
    if (format === 'csv' && type !== 'all' && type !== 'stats') {
      const data = result[type] as Record<string, unknown>[]
      if (!data || data.length === 0) {
        return new NextResponse('No data', { status: 404 })
      }

      // GDPR: Log data export
      await auditLog('DATA_EXPORT', { type, count: data.length }, request)

      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(';'),
        ...data.map(row =>
          headers.map(h => {
            const val = row[h]
            if (val === null || val === undefined) return ''
            if (typeof val === 'string' && val.includes(';')) return `"${val}"`
            return String(val)
          }).join(';')
        )
      ].join('\n')

      return new NextResponse('\ufeff' + csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=imeliq_${type}_${new Date().toISOString().split('T')[0]}.csv`
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error: unknown) {
    console.error('API Error:', error)
    let errorMessage: string
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message
    } else {
      errorMessage = String(error)
    }
    return NextResponse.json({ error: 'Database error', details: errorMessage }, { status: 500 })
  }
}

// DELETE - GDPR Art.17 Right to erasure
export async function DELETE(request: NextRequest) {
  const isAuthenticated = await checkAdminSession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'tester', 'feedback', 'order'
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID required' }, { status: 400 })
    }

    const tableMap: Record<string, string> = {
      tester: 'testers',
      feedback: 'feedback',
      order: 'orders'
    }

    const table = tableMap[type]
    if (!table) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    // GDPR: Log deletion request
    await auditLog('DATA_DELETE', { type, id }, request)

    const { error } = await getSupabase()
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: `${type} deleted successfully`
    })

  } catch (error: unknown) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
