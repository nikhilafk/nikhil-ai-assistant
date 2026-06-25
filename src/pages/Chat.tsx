import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const demoSessions = [
  { id: 1, lineUserId: 1, displayName: "John Smith", language: "en", messageCount: 12, firstSeen: new Date(Date.now() - 604800000).toISOString(), lastSeen: new Date(Date.now() - 300000).toISOString() },
  { id: 2, lineUserId: 2, displayName: "Mary Chen", language: "zh-TW", messageCount: 8, firstSeen: new Date(Date.now() - 86400000).toISOString(), lastSeen: new Date(Date.now() - 60000).toISOString() },
  { id: 3, lineUserId: 3, displayName: "David Lee", language: "en", messageCount: 5, firstSeen: new Date(Date.now() - 172800000).toISOString(), lastSeen: new Date(Date.now() - 3600000).toISOString() },
  { id: 4, lineUserId: 4, displayName: "Unknown User", language: "en", messageCount: 2, firstSeen: new Date(Date.now() - 259200000).toISOString(), lastSeen: new Date(Date.now() - 86400000).toISOString() },
];

const demoMessages: Record<number, Array<{ id: number; direction: "inbound" | "outbound"; content: string; createdAt: string }>> = {
  1: [
    { id: 1, direction: "inbound", content: "Hi, I need a website for my coffee shop", createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: 2, direction: "outbound", content: "Hello! I'm Nikhil AI Assistant. I'd be happy to help! What's your name?", createdAt: new Date(Date.now() - 280000).toISOString() },
    { id: 3, direction: "inbound", content: "I'm John Smith", createdAt: new Date(Date.now() - 260000).toISOString() },
    { id: 4, direction: "outbound", content: "Thanks John! What's your company name?", createdAt: new Date(Date.now() - 240000).toISOString() },
    { id: 5, direction: "inbound", content: "Coffee Corner", createdAt: new Date(Date.now() - 220000).toISOString() },
    { id: 6, direction: "outbound", content: "Great! What's the best email to reach you?", createdAt: new Date(Date.now() - 200000).toISOString() },
  ],
  2: [
    { id: 7, direction: "inbound", content: "預約諮詢", createdAt: new Date(Date.now() - 60000).toISOString() },
    { id: 8, direction: "outbound", content: "我來幫您安排諮詢！請問您的姓名是？", createdAt: new Date(Date.now() - 50000).toISOString() },
    { id: 9, direction: "inbound", content: "Mary Chen", createdAt: new Date(Date.now() - 40000).toISOString() },
  ],
};

export default function Chat() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const sessions = demoSessions.filter((s) =>
    (s.displayName || "").toLowerCase().includes(search.toLowerCase())
  );

  const userMessages = selectedUser ? (demoMessages[selectedUser] || []) : [];
  const selectedSession = demoSessions.find((s) => s.id === selectedUser);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Chat History</h1>
        <p className="text-slate-500">View conversations between users and the AI</p>
      </div>

      {selectedUser ? (
        <div className="space-y-4">
          <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Sessions
          </Button>
          <Card className="h-[calc(100vh-240px)] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-500" />
                {selectedSession?.displayName || "Conversation"}
                <span className="text-xs font-normal text-slate-400">
                  ({selectedSession?.language === "zh-TW" ? "Chinese" : "English"})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 space-y-3">
              {userMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.direction === "inbound" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${msg.direction === "inbound" ? "bg-slate-100 text-slate-800" : "bg-emerald-500 text-white"}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.direction === "inbound" ? "text-slate-400" : "text-emerald-100"}`}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedUser(session.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-700">{(session.displayName || "U").charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{session.displayName || "Unknown User"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{session.language === "zh-TW" ? "Chinese" : "English"}</span>
                        <span className="text-xs text-slate-400">{session.messageCount} messages</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {sessions.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No chat sessions found</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
