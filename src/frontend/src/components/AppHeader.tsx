import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import type { IDFusionRole } from "../api";
import { useAuth } from "../hooks/useAuth";
import { ROLE_BG_COLORS, ROLE_COLORS, ROLE_LABELS } from "../utils/roleUtils";

interface Props {
  profile: { name: string; idFusionRole: IDFusionRole };
}

export default function AppHeader({ profile }: Props) {
  const { logout } = useAuth();
  const roleLabel = ROLE_LABELS[profile.idFusionRole] ?? profile.idFusionRole;
  const roleBg = ROLE_BG_COLORS[profile.idFusionRole] ?? "bg-muted border-border";
  const roleColor = ROLE_COLORS[profile.idFusionRole] ?? "text-foreground";

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded bg-primary/15 border border-primary/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="oklch(0.72 0.15 195)" strokeWidth="1.5"/>
              <circle cx="9" cy="12" r="3" stroke="oklch(0.72 0.15 195)" strokeWidth="1.5"/>
              <path d="M14 9h4M14 12h4M14 15h2" stroke="oklch(0.72 0.15 195)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold text-base text-foreground tracking-tight">ID Fusion</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Identity Management</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-foreground">{profile.name || "—"}</span>
            <Badge variant="outline" className={`text-[10px] px-2 py-0 border ${roleBg} ${roleColor}`}>
              {roleLabel}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Sign out">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
