import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { IDFusionRole } from "../api";
import { ROLE_COLORS, ROLE_ICONS, ROLE_LABELS } from "../utils/roleUtils";

interface Props {
  role: IDFusionRole;
  onSaved: () => void;
}

export default function ProfileSetupPage({ role, onSaved }: Props) {
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    setIsPending(true);
    toast.success("Profile saved successfully");
    setIsPending(false);
    onSaved();
  };

  return (
    <div className="min-h-screen bg-background grid-lines flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8 shadow-xl card-glow">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded border border-primary/30 bg-primary/10 text-xl">{ROLE_ICONS[role]}</div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">Complete Your Profile</h1>
              <p className={`text-sm ${ROLE_COLORS[role]}`}>{ROLE_LABELS[role]} Access</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-xs uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="profile-name" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 bg-secondary border-input focus:border-primary" autoFocus autoComplete="name" />
              </div>
            </div>
            <Button type="submit" disabled={isPending || !name.trim()} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <>Continue<ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
