import { Shield } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: Props) {
  return (
    <div className="min-h-screen bg-background grid-lines flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground font-body tracking-wide">
            {message}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
