export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          is_admin: boolean | null
          is_email_verified: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean | null
          is_email_verified?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean | null
          is_email_verified?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      debug_logs: {
        Row: {
          id: string
          operation: string
          status: string
          details: Json | null
          error_code: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          operation: string
          status: string
          details?: Json | null
          error_code?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          operation?: string
          status?: string
          details?: Json | null
          error_code?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          entity: string | null
          entity_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action: string
          entity?: string | null
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          action?: string
          entity?: string | null
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
      }
      // Diğer tablolar da eklenebilir
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']

export type DebugLog = Database['public']['Tables']['debug_logs']['Row']

export type AdminLog = Database['public']['Tables']['admin_logs']['Row']
