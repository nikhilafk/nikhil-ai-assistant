import { useCallback, useState } from "react";
import { trpc } from "@/providers/trpc";

// Demo mode for static preview without backend OAuth
const DEMO_USER = {
  id: 1,
  unionId: "demo_admin",
  name: "Demo Admin",
  email: "demo@nikhil-ai.com",
  avatar: null,
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignInAt: new Date(),
};

const DEMO_KEY = "nikhil_ai_demo_auth";

function isDemoMode(): boolean {
  try {
    return localStorage.getItem(DEMO_KEY) === "1";
  } catch {
    return false;
  }
}

export function useAuth() {
  const [demoEnabled, setDemoEnabled] = useState(isDemoMode);
  const utils = trpc.useUtils();

  // Only call the real auth query if not in demo mode
  const {
    data: realUser,
    isLoading: realLoading,
  } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !demoEnabled,
  });

  const user = demoEnabled ? DEMO_USER : realUser;
  const isLoading = demoEnabled ? false : realLoading;

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  const login = useCallback(() => {
    try {
      const authUrlBase =
        import.meta.env.VITE_KIMI_AUTH_URL || "https://auth.kimi.com";
      const appId = import.meta.env.VITE_APP_ID || "";

      if (!appId || appId.length < 10) {
        throw new Error("OAuth not configured");
      }

      const authUrl = new URL(authUrlBase);
      authUrl.searchParams.set("client_id", appId);
      authUrl.searchParams.set(
        "redirect_uri",
        `${window.location.origin}/api/oauth/callback`
      );
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "profile");
      authUrl.searchParams.set("state", btoa(window.location.pathname));
      window.location.href = authUrl.toString();
    } catch {
      // Fall back to demo mode silently
      enableDemo();
    }
  }, []);

  const enableDemo = useCallback(() => {
    try {
      localStorage.setItem(DEMO_KEY, "1");
    } catch {
      // localStorage might be blocked
    }
    setDemoEnabled(true);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(DEMO_KEY);
    } catch {
      // ignore
    }
    setDemoEnabled(false);
    logoutMutation.mutate();
  }, [logoutMutation]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isDemo: demoEnabled,
    login,
    logout,
    enableDemo,
  };
}
