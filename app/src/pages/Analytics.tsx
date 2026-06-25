import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Users, MessageSquare, Target } from "lucide-react";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const leadsPerDay = [
  { date: "06-19", count: 1 }, { date: "06-20", count: 0 },
  { date: "06-21", count: 2 }, { date: "06-22", count: 0 },
  { date: "06-23", count: 1 }, { date: "06-24", count: 0 },
  { date: "06-25", count: 1 },
];

const leadsByType = [
  { name: "website", value: 2 }, { name: "chatbot", value: 1 },
  { name: "automation", value: 1 }, { name: "consulting", value: 1 },
];

const leadsBySource = [{ name: "line", value: 5 }];

export default function Analytics() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
          <p className="text-slate-500">Detailed insights and reports</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as "7d" | "30d" | "90d")}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: "24", icon: Users, color: "text-blue-500" },
          { label: "Messages", value: "130", icon: MessageSquare, color: "text-emerald-500" },
          { label: "Leads", value: "5", icon: Target, color: "text-amber-500" },
          { label: "Conversion Rate", value: "20.8%", icon: TrendingUp, color: "text-purple-500" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{kpi.label}</p>
                  <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
                <kpi.icon className={`w-8 h-8 ${kpi.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Leads Per Day</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={leadsPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Leads by Project Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={leadsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {leadsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Leads by Source</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={leadsBySource} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Consultation Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { status: "pending", count: 2, color: "#f59e0b" },
                { status: "confirmed", count: 1, color: "#10b981" },
                { status: "completed", count: 0, color: "#3b82f6" },
                { status: "cancelled", count: 0, color: "#ef4444" },
              ].map((item) => (
                <div key={item.status} className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 w-24 capitalize">{item.status}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min((item.count / 3) * 100, 100)}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
