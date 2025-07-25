import { createClient } from '@supabase/supabase-js'

// IMPORTANTE: Reemplaza con tus valores reales de Supabase
const supabaseUrl = 'https://slsievdsczoiajafklay.supabase.co'  // Tu Project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsc2lldmRzY3pvaWFqYWZrbGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTI2NzYsImV4cCI6MjA2OTAyODY3Nn0.jeJ7Pxy9Spo3e7fOAn0zuZPgGUkFMZ206NWAs-XLvu0'  // Tu anon key

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