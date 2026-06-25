import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Shield,
  MessageSquare,
  BarChart3,
  Sparkles,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, enableDemo } = useAuth();

  // Auto-redirect if already authenticated (demo mode)
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleDemo = () => {
    enableDemo();
    // navigate is handled by the useEffect above
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Nikhil AI Assistant
          </h1>
          <p className="text-slate-500 mt-1">
            Admin Dashboard for LINE Chatbot Management
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">Secure Admin Access</p>
                  <p className="text-xs text-slate-500">
                    Role-based dashboard with analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Manage Conversations</p>
                  <p className="text-xs text-slate-500">
                    View chat history and user sessions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Analytics & Insights</p>
                  <p className="text-xs text-slate-500">
                    Track leads, consultations, and performance
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDemo}
              className="w-full h-12 text-lg gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Sparkles className="w-5 h-5" />
              Enter Dashboard
            </Button>

            <div className="text-center">
              <Badge variant="outline" className="text-xs text-slate-400">
                Preview mode with demo data
              </Badge>
            </div>

            <p className="text-xs text-center text-slate-400">
              This is a preview with sample data. For production use,
              deploy with a backend server and configure OAuth.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
