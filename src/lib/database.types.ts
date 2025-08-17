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
      goal_boards: {
        Row: {
          id: string
          user_id: string
          timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'lifelong'
          title: string
          created_at: string
          updated_at: string
          completed_at?: string | null 
        }
        Insert: {
          id?: string
          user_id: string
          timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'lifelong'
          title: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null 
        }
        Update: {
          id?: string
          user_id?: string
          timeframe?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'lifelong'
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          board_id: string
          text: string
          completed: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          board_id: string
          text: string
          completed?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          text?: string
          completed?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}