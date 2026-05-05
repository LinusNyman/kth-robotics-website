import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Committee, OpenPosition, Organization } from "@/data/opportunities";

const ORG: Organization = "KTH Robotics";

export function useOpenPositions() {
  return useQuery({
    queryKey: ["open-positions", ORG],
    queryFn: async (): Promise<OpenPosition[]> => {
      const { data, error } = await supabase
        .from("open_positions")
        .select("*")
        .eq("is_active", true)
        .eq("organization", ORG)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching positions:", error);
        return [];
      }
      return (data ?? []).map((row: any) => ({
        id: row.id,
        role: row.role,
        committee: row.committee as Committee,
        description: row.description,
        organization: (row.organization as Organization) ?? ORG,
      }));
    },
  });
}

export interface JoinApplicationData {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  committee: string;
  motivation: string;
  experience: string;
  application_type: "specific" | "general";
  position_id?: string;
  ops_areas?: string[];
  ops_other?: string;
  dev_areas?: string[];
  dev_other?: string;
  board_areas?: string[];
  board_other?: string;
}

export function useSubmitJoinApplication() {
  return useMutation({
    mutationFn: async (data: JoinApplicationData) => {
      const { error } = await supabase.from("join_applications").insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        linkedin: data.linkedin || null,
        committee: data.committee,
        motivation: data.motivation,
        experience: data.experience || null,
        application_type: data.application_type,
        position_id: data.position_id || null,
        organization: ORG,
        ops_areas: data.ops_areas || [],
        ops_other: data.ops_other || null,
        dev_areas: data.dev_areas || [],
        dev_other: data.dev_other || null,
        board_areas: data.board_areas || [],
        board_other: data.board_other || null,
      } as any);
      if (error) throw error;
    },
  });
}
