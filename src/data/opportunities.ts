export type Committee = "Board" | "Development" | "Operations";

export type Organization =
  | "KTH Industrial Society"
  | "European Industrial Society"
  | "KTH Robotics"
  | "KTH Developer";

export interface OpenPosition {
  id: string;
  role: string;
  committee: Committee;
  description: string;
  organization: Organization;
}
