import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Settings as SettingsIcon, MessageSquare, Brain,
  Database, Shield, CheckCircle, XCircle,
} from "lucide-react";

const integrations = [
  { name: "LINE Messaging API", status: "connected", icon: MessageSquare, description: "Channel ID and webhook configuration" },
  { name: "OpenAI API", status: "connected", icon: Brain, description: "GPT-4o Mini for AI responses" },
  { name: "Google Sheets", status: "not_configured", icon: Database, description: "Lead and consultation sync (optional)" },
  { name: "Authentication", status: "connected", icon: Shield, description: "OAuth 2.0 with admin roles" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500">Manage your AI assistant configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-500" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <div key={integration.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm"><Icon className="w-5 h-5 text-slate-600" /></div>
                    <div>
                      <p className="font-medium text-slate-800">{integration.name}</p>
                      <p className="text-sm text-slate-500">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.status === "connected" ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <Badge className="bg-emerald-100 text-emerald-800">Connected</Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-slate-400" />
                        <Badge variant="outline" className="text-slate-500">Optional</Badge>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Bot Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-slate-500">Default Language</span><span className="text-sm font-medium">English + Traditional Chinese</span></div>
            <div className="flex justify-between"><span className="text-sm text-slate-500">Auto Sync</span><Badge className="bg-emerald-100 text-emerald-800">Enabled</Badge></div>
            <div className="flex justify-between"><span className="text-sm text-slate-500">AI Model</span><span className="text-sm font-medium">GPT-4o Mini</span></div>
            <div className="flex justify-between"><span className="text-sm text-slate-500">Temperature</span><span className="text-sm font-medium">0.7</span></div>
            <div className="flex justify-between"><span className="text-sm text-slate-500">Max Tokens</span><span className="text-sm font-medium">1,000</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Environment Variables</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "LINE_CHANNEL_ACCESS_TOKEN", required: true },
              { name: "LINE_CHANNEL_SECRET", required: true },
              { name: "OPENAI_API_KEY", required: true },
              { name: "GOOGLE_SERVICE_ACCOUNT_JSON", required: false },
              { name: "GOOGLE_SHEETS_ID", required: false },
              { name: "DATABASE_URL", required: true },
            ].map((env) => (
              <div key={env.name} className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-mono">{env.name}</span>
                <Badge variant={env.required ? "default" : "outline"} className="text-xs">{env.required ? "Required" : "Optional"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>LINE Webhook URL</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-2">Configure this URL in your LINE Developer Console:</p>
          <div className="flex gap-2">
            <code className="flex-1 bg-slate-100 p-3 rounded-lg text-sm font-mono text-slate-700">
              {typeof window !== "undefined" ? `${window.location.origin.replace(/\/#.*$/, "")}/api/webhook/line` : "https://your-domain.com/api/webhook/line"}
            </code>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(typeof window !== "undefined" ? `${window.location.origin.replace(/\/#.*$/, "")}/api/webhook/line` : "")}>Copy</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
