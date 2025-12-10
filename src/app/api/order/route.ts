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
    const { email, quantity, price_per_unit, pickup_location } = body

    // Validate required fields
    if (!email || !pickup_location) {
      return NextResponse.json(
        { error: 'Palun täida kõik väljad!' },
        { status: 400 }
      )
    }

    // Basic email validation
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Vigane emaili aadress' },
        { status: 400 }
      )
    }

    // Validate pickup location
    const validLocations = ['courier', 'tallinn', 'parnu', 'tartu', 'vantaa']
    if (!validLocations.includes(pickup_location)) {
      return NextResponse.json(
        { error: 'Vigane kättesaamise koht' },
        { status: 400 }
      )
    }

    // Validate quantity
    const qty = parseInt(quantity) || 1
    if (qty < 1 || qty > 100) {
      return NextResponse.json(
        { error: 'Kogus peab olema 1-100' },
        { status: 400 }
      )
    }

    // Insert order
    const { data, error } = await getSupabase()
      .from('orders')
      .insert([{
        email,
        quantity: qty,
        price_per_unit: price_per_unit || 1,
        pickup_location,
        status: 'pending'
      }])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Tellimus vastu võetud!',
      data: data[0]
    })

  } catch (error: unknown) {
    console.error('Order error:', error)
    let errorMessage = 'Viga tellimuse salvestamisel'
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
