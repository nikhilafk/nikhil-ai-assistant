import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { user, isAuthenticated, isDemo, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Nikhil AI Assistant
        </h2>
        <p className="text-xs text-slate-500">
          LINE Chatbot Management Dashboard
        </p>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-3">
              {isDemo && (
                <Badge className="bg-amber-100 text-amber-800 gap-1">
                  <Sparkles className="w-3 h-3" />
                  Demo Mode
                </Badge>
              )}
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">
                  {user?.name || "Admin"}
                </p>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600 capitalize">
                    {user?.role || "user"}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </>
        ) : (
          <div className="text-sm text-slate-400">Not logged in</div>
        )}
      </div>
    </header>
  );
}
