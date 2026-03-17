import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, Lock, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function WelcomePage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setIsLoading(true);
    const success = await login(username.trim(), password);
    setIsLoading(false);
    if (!success) {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background grid-lines relative overflow-hidden">
      {/* Atmospheric glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full opacity-[0.07]"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.72 0.15 195), transparent)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[450px] h-[450px] rounded-full opacity-[0.05]"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.78 0.14 75), transparent)",
          }}
        />
        <div
          className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full opacity-[0.04]"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.65 0.18 145), transparent)",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Nav bar */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded bg-primary/15 border border-primary/30">
              <img
                src="/assets/generated/idfusion-logo-transparent.dim_80x80.png"
                alt="ID Fusion"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-base text-foreground">
                ID Fusion
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Identity Management System
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span className="hidden sm:block">Secured Access Portal</span>
          </div>
        </nav>

        {/* Main login area */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 mb-5 secure-badge">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-muted-foreground text-sm">
                Sign in to access the ID Fusion portal
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-card border border-border rounded-xl p-8 card-glow">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-foreground"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                    }}
                    autoComplete="username"
                    autoFocus
                    className="bg-background border-input focus:border-primary h-11"
                    data-ocid="login.input"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      autoComplete="current-password"
                      className="bg-background border-input focus:border-primary h-11 pr-11"
                      data-ocid="login.input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                    data-ocid="login.error_state"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  data-ocid="login.primary_button"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Role hint */}
              <div className="mt-6 pt-5 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  Access is role-based. Contact the administrator if you need
                  credentials.
                </p>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
