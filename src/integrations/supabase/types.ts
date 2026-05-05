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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_title: string | null
          entity_type: string | null
          id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_title?: string | null
          entity_type?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_title?: string | null
          entity_type?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      announcement_banners: {
        Row: {
          bg_color: string
          created_at: string
          ends_at: string
          id: string
          is_enabled: boolean
          link_label: string | null
          link_url: string | null
          message: string
          sort_order: number
          starts_at: string
          updated_at: string
        }
        Insert: {
          bg_color?: string
          created_at?: string
          ends_at: string
          id?: string
          is_enabled?: boolean
          link_label?: string | null
          link_url?: string | null
          message: string
          sort_order?: number
          starts_at: string
          updated_at?: string
        }
        Update: {
          bg_color?: string
          created_at?: string
          ends_at?: string
          id?: string
          is_enabled?: boolean
          link_label?: string | null
          link_url?: string | null
          message?: string
          sort_order?: number
          starts_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          content: string
          created_at: string | null
          date: string
          excerpt: string
          id: string
          image_url: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author: string
          content: string
          created_at?: string | null
          date: string
          excerpt: string
          id?: string
          image_url?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          content?: string
          created_at?: string | null
          date?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      career_opportunities: {
        Row: {
          company: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean
          location: string
          role: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          company: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string
          role: string
          type?: string
          updated_at?: string
          url?: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string
          role?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_archived: boolean
          is_read: boolean
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message: string
          name: string
          subject?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      directives: {
        Row: {
          content: string
          created_at: string | null
          division: string
          ends_at: string
          id: string
          starts_at: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          division?: string
          ends_at: string
          id?: string
          starts_at?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          division?: string
          ends_at?: string
          id?: string
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          date: string
          description: string
          end_date: string | null
          id: string
          image_url: string | null
          is_past: boolean
          location: string
          registration_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          description: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_past?: boolean
          location: string
          registration_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_past?: boolean
          location?: string
          registration_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_featured: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          sort_order: number
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          sort_order?: number
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          sort_order?: number
        }
        Relationships: []
      }
      join_applications: {
        Row: {
          application_type: string
          board_areas: string[] | null
          board_other: string | null
          committee: string
          created_at: string
          dev_areas: string[] | null
          dev_other: string | null
          email: string
          experience: string | null
          id: string
          linkedin: string | null
          motivation: string
          name: string
          ops_areas: string[] | null
          ops_other: string | null
          organization: Database["public"]["Enums"]["position_organization"]
          phone: string | null
          position_id: string | null
          status: string
        }
        Insert: {
          application_type?: string
          board_areas?: string[] | null
          board_other?: string | null
          committee: string
          created_at?: string
          dev_areas?: string[] | null
          dev_other?: string | null
          email: string
          experience?: string | null
          id?: string
          linkedin?: string | null
          motivation: string
          name: string
          ops_areas?: string[] | null
          ops_other?: string | null
          organization?: Database["public"]["Enums"]["position_organization"]
          phone?: string | null
          position_id?: string | null
          status?: string
        }
        Update: {
          application_type?: string
          board_areas?: string[] | null
          board_other?: string | null
          committee?: string
          created_at?: string
          dev_areas?: string[] | null
          dev_other?: string | null
          email?: string
          experience?: string | null
          id?: string
          linkedin?: string | null
          motivation?: string
          name?: string
          ops_areas?: string[] | null
          ops_other?: string | null
          organization?: Database["public"]["Enums"]["position_organization"]
          phone?: string | null
          position_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "open_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_sends: {
        Row: {
          content: string
          created_at: string | null
          id: string
          recipient_count: number
          sent_by: string | null
          status: string
          subject: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          recipient_count?: number
          sent_by?: string | null
          status?: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          recipient_count?: number
          sent_by?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmation_token: string | null
          confirmed: boolean
          email: string
          id: string
          subscribed_at: string | null
        }
        Insert: {
          confirmation_token?: string | null
          confirmed?: boolean
          email: string
          id?: string
          subscribed_at?: string | null
        }
        Update: {
          confirmation_token?: string | null
          confirmed?: boolean
          email?: string
          id?: string
          subscribed_at?: string | null
        }
        Relationships: []
      }
      open_positions: {
        Row: {
          committee: Database["public"]["Enums"]["committee_type"]
          created_at: string
          description: string
          id: string
          is_active: boolean
          organization: Database["public"]["Enums"]["position_organization"]
          role: string
          updated_at: string
        }
        Insert: {
          committee: Database["public"]["Enums"]["committee_type"]
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          organization?: Database["public"]["Enums"]["position_organization"]
          role: string
          updated_at?: string
        }
        Update: {
          committee?: Database["public"]["Enums"]["committee_type"]
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          organization?: Database["public"]["Enums"]["position_organization"]
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_visibility: {
        Row: {
          is_public: boolean
          organization: Database["public"]["Enums"]["position_organization"]
          updated_at: string
        }
        Insert: {
          is_public?: boolean
          organization: Database["public"]["Enums"]["position_organization"]
          updated_at?: string
        }
        Update: {
          is_public?: boolean
          organization?: Database["public"]["Enums"]["position_organization"]
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          show_on_homepage: boolean
          sort_order: number
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          show_on_homepage?: boolean
          sort_order?: number
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          show_on_homepage?: boolean
          sort_order?: number
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      playbook_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          is_visible: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          is_visible?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_visible?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      project_partners: {
        Row: {
          id: string
          partner_id: string
          project_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          partner_id: string
          project_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          partner_id?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_partners_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_partners_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          long_description: string
          number: string
          slug: string
          status: string
          team: string
          timeline: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          long_description?: string
          number: string
          slug: string
          status?: string
          team?: string
          timeline?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          long_description?: string
          number?: string
          slug?: string
          status?: string
          team?: string
          timeline?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stat_data_points: {
        Row: {
          created_at: string
          id: string
          metric_id: string
          note: string | null
          recorded_at: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metric_id: string
          note?: string | null
          recorded_at?: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          metric_id?: string
          note?: string | null
          recorded_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "stat_data_points_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "stat_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      stat_metrics: {
        Row: {
          color: string
          created_at: string
          homepage_description: string
          id: string
          name: string
          show_on_homepage: boolean
          sort_order: number
          unit: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          homepage_description?: string
          id?: string
          name: string
          show_on_homepage?: boolean
          sort_order?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          homepage_description?: string
          id?: string
          name?: string
          show_on_homepage?: boolean
          sort_order?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          committee: Database["public"]["Enums"]["committee_type"]
          created_at: string | null
          email: string | null
          id: string
          image_url: string | null
          linkedin: string | null
          name: string
          role: string
          updated_at: string | null
          website: string | null
          year: string
        }
        Insert: {
          committee: Database["public"]["Enums"]["committee_type"]
          created_at?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          linkedin?: string | null
          name: string
          role: string
          updated_at?: string | null
          website?: string | null
          year: string
        }
        Update: {
          committee?: Database["public"]["Enums"]["committee_type"]
          created_at?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          linkedin?: string | null
          name?: string
          role?: string
          updated_at?: string | null
          website?: string | null
          year?: string
        }
        Relationships: []
      }
      user_privileges: {
        Row: {
          is_admin: boolean | null
          privileges: string[] | null
          user_id: string
        }
        Insert: {
          is_admin?: boolean | null
          privileges?: string[] | null
          user_id: string
        }
        Update: {
          is_admin?: boolean | null
          privileges?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      team_members_public: {
        Row: {
          committee: Database["public"]["Enums"]["committee_type"] | null
          created_at: string | null
          id: string | null
          image_url: string | null
          linkedin: string | null
          name: string | null
          role: string | null
          updated_at: string | null
          website: string | null
          year: string | null
        }
        Insert: {
          committee?: Database["public"]["Enums"]["committee_type"] | null
          created_at?: string | null
          id?: string | null
          image_url?: string | null
          linkedin?: string | null
          name?: string | null
          role?: string | null
          updated_at?: string | null
          website?: string | null
          year?: string | null
        }
        Update: {
          committee?: Database["public"]["Enums"]["committee_type"] | null
          created_at?: string | null
          id?: string | null
          image_url?: string | null
          linkedin?: string | null
          name?: string | null
          role?: string | null
          updated_at?: string | null
          website?: string | null
          year?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      confirm_newsletter_subscription: {
        Args: { _token: string }
        Returns: boolean
      }
      ensure_profile: {
        Args: { _email: string; _user_id: string }
        Returns: undefined
      }
      get_my_privileges: {
        Args: never
        Returns: {
          is_admin: boolean
          privileges: string[]
        }[]
      }
      has_privilege: {
        Args: { _privilege: string; _user_id: string }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      committee_type: "Board" | "Development" | "Operations"
      position_organization:
        | "KTH Industrial Society"
        | "European Industrial Society"
        | "KTH Robotics"
        | "KTH Developer"
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
    Enums: {
      committee_type: ["Board", "Development", "Operations"],
      position_organization: [
        "KTH Industrial Society",
        "European Industrial Society",
        "KTH Robotics",
        "KTH Developer",
      ],
    },
  },
} as const
