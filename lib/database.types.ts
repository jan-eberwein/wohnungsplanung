export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      cooking_log: {
        Row: {
          cooked_at: string
          cooked_by: string
          id: string
          recipe_id: string
        }
        Insert: {
          cooked_at?: string
          cooked_by: string
          id?: string
          recipe_id: string
        }
        Update: {
          cooked_at?: string
          cooked_by?: string
          id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cooking_log_cooked_by_fkey"
            columns: ["cooked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooking_log_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      date_ideas: {
        Row: {
          category: string
          created_at: string
          description: string | null
          emoji: string | null
          id: string
          is_custom: boolean
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_custom?: boolean
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_custom?: boolean
          title?: string
        }
        Relationships: []
      }
      date_photos: {
        Row: {
          created_at: string
          date_id: string
          id: string
          image_path: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          date_id: string
          id?: string
          image_path: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          date_id?: string
          id?: string
          image_path?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "date_photos_date_id_fkey"
            columns: ["date_id"]
            isOneToOne: false
            referencedRelation: "dates"
            referencedColumns: ["id"]
          },
        ]
      }
      dates: {
        Row: {
          category: string | null
          completed_on: string | null
          created_at: string
          created_by: string
          emoji: string | null
          id: string
          idea_id: string | null
          location: string | null
          notes: string | null
          rating: number | null
          scheduled_for: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          completed_on?: string | null
          created_at?: string
          created_by: string
          emoji?: string | null
          id?: string
          idea_id?: string | null
          location?: string | null
          notes?: string | null
          rating?: number | null
          scheduled_for?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          completed_on?: string | null
          created_at?: string
          created_by?: string
          emoji?: string | null
          id?: string
          idea_id?: string | null
          location?: string | null
          notes?: string | null
          rating?: number | null
          scheduled_for?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dates_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "date_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_items: {
        Row: {
          id: string
          low_stock: boolean
          name: string
          quantity: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          low_stock?: boolean
          name: string
          quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          low_stock?: boolean
          name?: string
          quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent_color: string
          created_at: string
          display_name: string
          id: string
          username: string
        }
        Insert: {
          accent_color: string
          created_at?: string
          display_name: string
          id: string
          username: string
        }
        Update: {
          accent_color?: string
          created_at?: string
          display_name?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          id: string
          name: string
          purchase_id: string
          quantity: number | null
          unit: string | null
        }
        Insert: {
          id?: string
          name: string
          purchase_id: string
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          id?: string
          name?: string
          purchase_id?: string
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          id: string
          note: string | null
          paid_by: string
          receipt_path: string | null
          split_details: Json | null
          split_type: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          paid_by: string
          receipt_path?: string | null
          split_details?: Json | null
          split_type?: string
          total_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          paid_by?: string
          receipt_path?: string | null
          split_details?: Json | null
          split_type?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchases_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          id: string
          name: string
          quantity: number | null
          recipe_id: string
          sort_order: number
          unit: string | null
        }
        Insert: {
          id?: string
          name: string
          quantity?: number | null
          recipe_id: string
          sort_order?: number
          unit?: string | null
        }
        Update: {
          id?: string
          name?: string
          quantity?: number | null
          recipe_id?: string
          sort_order?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          image_path: string | null
          instructions: string
          tags: string[]
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          image_path?: string | null
          instructions?: string
          tags?: string[]
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          image_path?: string | null
          instructions?: string
          tags?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          amount: number
          created_at: string
          from_profile: string
          id: string
          to_profile: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_profile: string
          id?: string
          to_profile: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_profile?: string
          id?: string
          to_profile?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlements_from_profile_fkey"
            columns: ["from_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_to_profile_fkey"
            columns: ["to_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_items: {
        Row: {
          added_by: string
          category_id: string | null
          checked_at: string | null
          created_at: string
          from_recipe_id: string | null
          id: string
          is_checked: boolean
          name: string
          quantity: number | null
          unit: string | null
        }
        Insert: {
          added_by: string
          category_id?: string | null
          checked_at?: string | null
          created_at?: string
          from_recipe_id?: string | null
          id?: string
          is_checked?: boolean
          name: string
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          added_by?: string
          category_id?: string | null
          checked_at?: string | null
          created_at?: string
          from_recipe_id?: string | null
          id?: string
          is_checked?: boolean
          name?: string
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_items_from_recipe_id_fkey"
            columns: ["from_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      week_plan: {
        Row: {
          created_at: string
          created_by: string
          id: string
          plan_date: string
          recipe_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          plan_date: string
          recipe_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          plan_date?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "week_plan_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "week_plan_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_member: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
