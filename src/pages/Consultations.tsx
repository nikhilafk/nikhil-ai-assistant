import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Mail, Phone, MessageSquare } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

const demoConsultations = [
  { id: 1, name: "Mary Chen", email: "mary@techstart.com", phone: "+886912345678", preferredDate: "2026-06-28", preferredTime: "14:00", contactMethod: "line", topic: "Chatbot for customer service", status: "pending" },
  { id: 2, name: "David Lee", email: "david@lee.com", phone: "+886987654321", preferredDate: "2026-06-30", preferredTime: "10:00", contactMethod: "email", topic: "Workflow automation consultation", status: "confirmed" },
  { id: 3, name: "Sarah Wang", email: "sarah@wang.com", phone: "+886955443322", preferredDate: "2026-07-02", preferredTime: "16:00", contactMethod: "phone", topic: "AI integration for existing platform", status: "pending" },
];

export default function Consultations() {
  const [statusFilter, setStatusFilter] = useState("");

  const consultations = demoConsultations.filter((c) => !statusFilter || c.status === statusFilter);

  const stats = [
    { label: "Total", value: 3, color: "bg-slate-500" },
    { label: "Pending", value: 2, color: "bg-amber-500" },
    { label: "Confirmed", value: 1, color: "bg-emerald-500" },
    { label: "Completed", value: 0, color: "bg-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Consultations</h1>
        <p className="text-slate-500">Manage consultation bookings and requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}><CalendarDays className="w-5 h-5 text-white" /></div>
              <div><p className="text-2xl font-bold text-slate-800">{stat.value}</p><p className="text-sm text-slate-500">{stat.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Contact</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Date & Time</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Topic</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3"><p className="text-sm font-medium text-slate-800">{c.name}</p></td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {c.email && <div className="flex items-center gap-1 text-xs text-slate-500"><Mail className="w-3 h-3" />{c.email}</div>}
                        {c.phone && <div className="flex items-center gap-1 text-xs text-slate-500"><Phone className="w-3 h-3" />{c.phone}</div>}
                        <div className="flex items-center gap-1 text-xs text-slate-500"><MessageSquare className="w-3 h-3" />{c.contactMethod}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-slate-600"><CalendarDays className="w-4 h-4" />{c.preferredDate ? new Date(c.preferredDate).toLocaleDateString() : "Not set"}</div>
                        <div className="flex items-center gap-1 text-sm text-slate-600"><Clock className="w-4 h-4" />{c.preferredTime || "Not set"}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.topic || "-"}</td>
                    <td className="px-4 py-3"><Badge className={statusColors[c.status] || ""}>{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
