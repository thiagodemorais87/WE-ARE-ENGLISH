export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'student' | 'teacher' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          role?: 'student' | 'teacher' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'student' | 'teacher' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      activities: {
        Row: {
          id: string
          title: string
          description: string
          type: string
          level: string
          difficulty: string
          instructions: string
          content: Json
          audio_url: string | null
          image_url: string | null
          duration: number
          points: number
          is_published: boolean
          is_system: boolean
          created_by: string | null
          audio_voice_id: string | null
          audio_model_id: string | null
          voice_name: string | null
          accent: string | null
          speed: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          type: string
          level: string
          difficulty: string
          instructions?: string
          content?: Json
          audio_url?: string | null
          image_url?: string | null
          duration?: number
          points?: number
          is_published?: boolean
          is_system?: boolean
          created_by?: string | null
          audio_voice_id?: string | null
          audio_model_id?: string | null
          voice_name?: string | null
          accent?: string | null
          speed?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: string
          level?: string
          difficulty?: string
          instructions?: string
          content?: Json
          audio_url?: string | null
          image_url?: string | null
          duration?: number
          points?: number
          is_published?: boolean
          is_system?: boolean
          created_by?: string | null
          audio_voice_id?: string | null
          audio_model_id?: string | null
          voice_name?: string | null
          accent?: string | null
          speed?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'activities_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      activity_attempts: {
        Row: {
          id: string
          activity_id: string
          user_id: string
          answer: Json
          score: number | null
          feedback: Json | null
          started_at: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          user_id: string
          answer?: Json
          score?: number | null
          feedback?: Json | null
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          user_id?: string
          answer?: Json
          score?: number | null
          feedback?: Json | null
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'activity_attempts_activity_id_fkey'
            columns: ['activity_id']
            isOneToOne: false
            referencedRelation: 'activities'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'activity_attempts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      voices: {
        Row: {
          id: string
          provider: string
          voice_id: string
          name: string
          accent: string | null
          default_model_id: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          provider?: string
          voice_id: string
          name: string
          accent?: string | null
          default_model_id?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          provider?: string
          voice_id?: string
          name?: string
          accent?: string | null
          default_model_id?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
