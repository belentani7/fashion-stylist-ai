import { trpc } from "@/lib/trpc";

export interface AuthUser {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  createdAt: string | Date;
  updatedAt: string | Date;
  lastSignedIn: string | Date | null;
}

export function useAuth() {
  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      try {
        sessionStorage.removeItem("manus-cookie");
      } catch {}
      window.location.href = "/";
    },
  });

  const user = (meQuery.data ?? null) as AuthUser | null;
  const loading = meQuery.isLoading;
  const isAuthenticated = Boolean(user);

  const logout = () => logoutMutation.mutate();

  return {
    user,
    loading,
    isAuthenticated,
    logout,
    error: meQuery.error,
  };
}
