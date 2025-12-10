import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\n/g, '')
    const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON || '').trim().replace(/\n/g, '')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabase = createClient(supabaseUrl, supabaseKey)
  }
  return supabase
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_code, referrer_name, feeling, comments } = body

    // Validate required fields
    if (!product_code || !referrer_name || !feeling) {
      return NextResponse.json(
        { error: 'Palun täida kõik kohustuslikud väljad!' },
        { status: 400 }
      )
    }

    // Validate feeling value
    if (!['nothing', 'energy', 'other'].includes(feeling)) {
      return NextResponse.json(
        { error: 'Vigane tagasiside väärtus' },
        { status: 400 }
      )
    }

    // Insert feedback
    const { data, error } = await getSupabase()
      .from('feedback')
      .insert([{
        product_code,
        referrer_name,
        feeling,
        comments: comments || null
      }])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Tagasiside salvestatud!',
      data: data[0]
    })

  } catch (error: unknown) {
    console.error('Feedback error:', error)
    let errorMessage = 'Viga tagasiside salvestamisel'
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
