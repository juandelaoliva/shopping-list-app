import { createClient } from '@supabase/supabase-js'

// Configuración dinámica para desarrollo y producción
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xxxxx.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// Validación de variables de entorno
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file or Vercel settings.')
}

// Crear cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types para TypeScript
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          color: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          color?: string
          icon?: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          color?: string
          icon?: string
          created_at?: string
        }
      }
      supermarkets: {
        Row: {
          id: number
          name: string
          logo_url: string | null
          color: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          logo_url?: string | null
          color?: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          logo_url?: string | null
          color?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: number
          name: string
          category_id: number | null
          supermarket_id: number | null
          estimated_price: number | null
          unit: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          category_id?: number | null
          supermarket_id?: number | null
          estimated_price?: number | null
          unit?: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          category_id?: number | null
          supermarket_id?: number | null
          estimated_price?: number | null
          unit?: string
          created_at?: string
        }
      }
      shopping_lists: {
        Row: {
          id: number
          user_id: string
          name: string
          description: string | null
          total_budget: number | null
          is_completed: boolean
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          description?: string | null
          total_budget?: number | null
          is_completed?: boolean
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          description?: string | null
          total_budget?: number | null
          is_completed?: boolean
          created_at?: string
          completed_at?: string | null
        }
      }
      list_items: {
        Row: {
          id: number
          shopping_list_id: number
          product_id: number | null
          custom_product_name: string | null
          quantity: number
          unit: string
          estimated_price: number | null
          actual_price: number | null
          is_purchased: boolean
          notes: string | null
          created_at: string
          purchased_at: string | null
        }
        Insert: {
          id?: number
          shopping_list_id: number
          product_id?: number | null
          custom_product_name?: string | null
          quantity?: number
          unit?: string
          estimated_price?: number | null
          actual_price?: number | null
          is_purchased?: boolean
          notes?: string | null
          created_at?: string
          purchased_at?: string | null
        }
        Update: {
          id?: number
          shopping_list_id?: number
          product_id?: number | null
          custom_product_name?: string | null
          quantity?: number
          unit?: string
          estimated_price?: number | null
          actual_price?: number | null
          is_purchased?: boolean
          notes?: string | null
          created_at?: string
          purchased_at?: string | null
        }
      }
    }
  }
} 