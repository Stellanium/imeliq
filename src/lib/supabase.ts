import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
