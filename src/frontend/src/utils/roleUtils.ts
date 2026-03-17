import type { IDFusionRole } from "../api";

export const ROLE_LABELS: Record<IDFusionRole, string> = {
  admin: "Administrator",
  general: "General",
  rto: "RTO Officer",
  passport: "Passport Officer",
  voter: "Voter Officer",
};

export const ROLE_COLORS: Record<IDFusionRole, string> = {
  admin: "text-accent",
  general: "text-primary",
  rto: "text-emerald-400",
  passport: "text-purple-400",
  voter: "text-orange-400",
};

export const ROLE_BG_COLORS: Record<IDFusionRole, string> = {
  admin: "bg-accent/10 border-accent/30",
  general: "bg-primary/10 border-primary/30",
  rto: "bg-emerald-500/10 border-emerald-500/30",
  passport: "bg-purple-500/10 border-purple-500/30",
  voter: "bg-orange-500/10 border-orange-500/30",
};

export const ROLE_ICONS: Record<IDFusionRole, string> = {
  admin: "🛡️",
  general: "👤",
  rto: "🚗",
  passport: "✈️",
  voter: "🗳️",
};

export const ROLE_DESCRIPTIONS: Record<IDFusionRole, string> = {
  admin: "Full access — manage all identity records",
  general: "View Aadhaar, PAN & Ration Card",
  rto: "View Driving License & RC Card",
  passport: "View Passport records",
  voter: "View Voter ID records",
};
