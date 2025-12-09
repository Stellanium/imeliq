import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Clean environment variables (remove newlines that may be added by Vercel)
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\n/g, '')
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim().replace(/\n/g, '')

const supabase = createClient(supabaseUrl, supabaseKey)

// API key for authentication
const API_KEY = process.env.IMELIQ_API_KEY || 'imeliq-secret-key-2024'

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '')
  return token === API_KEY
}

export async function GET(request: NextRequest) {
  // Check API key
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'
  const format = searchParams.get('format') || 'json'

  try {
    const result: Record<string, unknown> = {}

    // Fetch requested data
    if (type === 'all' || type === 'feedback') {
      const { data: feedback, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      result.feedback = feedback
    }

    if (type === 'all' || type === 'orders') {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      result.orders = orders
    }

    if (type === 'all' || type === 'testers') {
      const { data: testers, error } = await supabase
        .from('testers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      result.testers = testers
    }

    if (type === 'all' || type === 'stats') {
      const { data: stats, error } = await supabase
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

    // CSV format
    if (format === 'csv' && type !== 'all' && type !== 'stats') {
      const data = result[type] as Record<string, unknown>[]
      if (!data || data.length === 0) {
        return new NextResponse('No data', { status: 404 })
      }

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
    // Handle Supabase PostgrestError and regular errors
    let errorMessage: string
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message
    } else if (error && typeof error === 'object') {
      errorMessage = JSON.stringify(error)
    } else {
      errorMessage = String(error)
    }
    return NextResponse.json(
      {
        error: 'Database error',
        details: errorMessage,
        env_check: {
          has_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          has_service_key: !!process.env.SUPABASE_SERVICE_KEY,
          has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      },
      { status: 500 }
    )
  }
}
