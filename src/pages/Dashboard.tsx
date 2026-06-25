import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, MessageSquare, UserPlus, CalendarDays,
  TrendingUp, Activity,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const demoMessages = [
  { date: "06-19", count: 12 }, { date: "06-20", count: 18 },
  { date: "06-21", count: 8 }, { date: "06-22", count: 25 },
  { date: "06-23", count: 15 }, { date: "06-24", count: 30 },
  { date: "06-25", count: 22 },
];

const demoLangData = [
  { name: "English", value: 65 }, { name: "Chinese", value: 35 },
];

const demoLeadStatus = [
  { name: "new", value: 2 }, { name: "qualified", value: 1 },
  { name: "contacted", value: 1 }, { name: "converted", value: 1 },
];

const demoRecentActivity = [
  { id: 1, direction: "inbound" as const, content: "Hi, I need a website for my coffee shop", displayName: "John Smith", createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: 2, direction: "outbound" as const, content: "Hello! I'd be happy to help. What's your name?", displayName: "AI Bot", createdAt: new Date(Date.now() - 240000).toISOString() },
  { id: 3, direction: "inbound" as const, content: "I'm John. Can you build e-commerce sites?", displayName: "John Smith", createdAt: new Date(Date.now() - 180000).toISOString() },
  { id: 4, direction: "outbound" as const, content: "Yes! Nikhil specializes in modern websites. Let me collect some details.", displayName: "AI Bot", createdAt: new Date(Date.now() - 120000).toISOString() },
  { id: 5, direction: "inbound" as const, content: "預約諮詢", displayName: "Mary Chen", createdAt: new Date(Date.now() - 60000).toISOString() },
];

export default function Dashboard() {
  const kpiCards = [
    { title: "Total LINE Users", value: 24, icon: Users, color: "bg-blue-500" },
    { title: "Total Messages", value: 130, icon: MessageSquare, color: "bg-emerald-500" },
    { title: "Total Leads", value: 5, icon: UserPlus, color: "bg-amber-500" },
    { title: "Consultations", value: 3, icon: CalendarDays, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Overview of your AI assistant performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{card.value.toLocaleString()}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Messages (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={demoMessages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Language Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={demoLangData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {demoLangData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {demoLangData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-slate-600">{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Lead Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoLeadStatus.map((status) => (
                <div key={status.name} className="flex items-center justify-between">
                  <span className="capitalize text-sm text-slate-700 font-medium">{status.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(status.value / 5) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-800 w-6">{status.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-auto">
              {demoRecentActivity.map((conv) => (
                <div key={conv.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${conv.direction === "inbound" ? "bg-blue-500" : "bg-emerald-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{conv.displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{conv.content}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {conv.createdAt ? new Date(conv.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
