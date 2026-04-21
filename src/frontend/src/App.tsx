import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { IDFusionRole } from "./api";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AdminDashboard from "./pages/AdminDashboard";
import RoleDashboard from "./pages/RoleDashboard";
import WelcomePage from "./pages/WelcomePage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function AppContent() {
  const { isLoggedIn, role, username } = useAuth();

  if (!isLoggedIn || !role) return <WelcomePage />;

  const profile = { name: username, idFusionRole: role as IDFusionRole };

  if (role === "admin") return <AdminDashboard profile={profile} />;
  return <RoleDashboard profile={profile} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-center" theme="dark" />
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
