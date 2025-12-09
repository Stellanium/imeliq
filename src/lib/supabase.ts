import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy-init supabase client to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
    const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Backwards compatible getter - use getSupabase() instead for new code
// This is a getter that creates the client on first access, not at module load time
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabase()[prop as keyof SupabaseClient]
  }
})

export type Tester = {
  id: string
  name: string
  family_name?: string
  email: string
  phone?: string
  marketing_consent: boolean
  created_at: string
}

export type Feedback = {
  id: string
  tester_id?: string
  product_code: string
  referrer_name: string
  feeling: 'nothing' | 'energy' | 'other'
  comments?: string
  created_at: string
}

export type Order = {
  id: string
  tester_id?: string
  email: string
  quantity: number
  price_per_unit: number
  pickup_location: 'courier' | 'tallinn' | 'parnu' | 'tartu' | 'vantaa'
  status: 'pending' | 'confirmed' | 'delivered'
  created_at: string
}
