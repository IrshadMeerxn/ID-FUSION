import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Card } from "../api";

interface Props {
  title: string;
  card?: Card | null;
  accentColor?: string;
}

export default function IDCardDisplay({ title, card, accentColor = "text-primary" }: Props) {
  const [showPhoto, setShowPhoto] = useState(false);

  if (!card) {
    return (
      <div className="rounded border border-border bg-muted/20 p-4 flex items-center gap-3 opacity-50">
        <CreditCard className="w-5 h-5 text-muted-foreground shrink-0" />
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-xs text-muted-foreground">Not available</p>
        </div>
      </div>
    );
  }

  const photoUrl = card.photoUrl;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded border border-border bg-card overflow-hidden card-glow card-glow-hover">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <CreditCard className={`w-4 h-4 ${accentColor}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</span>
        </div>
        <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">Verified</Badge>
      </div>
      <div className="px-4 py-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Card Number</p>
        <p className="id-number text-sm text-foreground font-medium">{card.cardNumber}</p>
      </div>
      {photoUrl && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Photo</p>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowPhoto((v) => !v)}>
                {showPhoto ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                {showPhoto ? "Hide" : "Show"}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={() => window.open(photoUrl, "_blank")}>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <AnimatePresence>
            {showPhoto && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <img src={photoUrl} alt={`${title} card`} className="w-full rounded object-cover max-h-48" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
