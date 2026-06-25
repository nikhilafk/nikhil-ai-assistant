import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye, Filter, Users } from "lucide-react";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  qualified: "bg-amber-100 text-amber-800",
  contacted: "bg-purple-100 text-purple-800",
  converted: "bg-emerald-100 text-emerald-800",
  lost: "bg-red-100 text-red-800",
};

const projectTypeLabels: Record<string, string> = {
  website: "Website", automation: "Automation", chatbot: "Chatbot",
  ai_integration: "AI Integration", consulting: "Consulting", other: "Other",
};

const demoLeads = [
  { id: 1, name: "John Smith", company: "Coffee Shop", email: "john@example.com", phone: "+1234567890", projectType: "website", budget: "$5,000", status: "new", requirements: "Need a modern website with online menu and reservation system", createdAt: new Date().toISOString() },
  { id: 2, name: "Mary Chen", company: "TechStart", email: "mary@techstart.com", phone: "+886912345678", projectType: "chatbot", budget: "$3,000", status: "qualified", requirements: "LINE chatbot for customer service with FAQ automation", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, name: "David Lee", company: "Lee Consulting", email: "david@lee.com", phone: "+886987654321", projectType: "automation", budget: "$10,000", status: "contacted", requirements: "Workflow automation for sales process and lead tracking", createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 4, name: "Sarah Wang", company: "Wang Designs", email: "sarah@wang.com", phone: "+886955443322", projectType: "ai_integration", budget: "$8,000", status: "new", requirements: "Add AI features to existing e-commerce platform", createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 5, name: "Michael Liu", company: "Liu Corp", email: "michael@liu.com", phone: "+886911223344", projectType: "consulting", budget: "$2,000", status: "converted", requirements: "Technology strategy consultation for digital transformation", createdAt: new Date(Date.now() - 345600000).toISOString() },
];

export default function Leads() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<typeof demoLeads[0] | null>(null);

  const leads = demoLeads.filter((lead) => {
    const matchesSearch = !search || lead.name.toLowerCase().includes(search.toLowerCase()) || lead.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leads</h1>
          <p className="text-slate-500">Manage and track captured leads</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="qualified">Qualified</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Company</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Project</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Budget</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-400"><Users className="w-8 h-8 mx-auto mb-2 opacity-50" />No leads found</td></tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-800">{lead.name}</p>
                        <p className="text-xs text-slate-500">{lead.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{lead.company}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{projectTypeLabels[lead.projectType]}</Badge></td>
                      <td className="px-4 py-3"><Badge className={statusColors[lead.status]}>{lead.status}</Badge></td>
                      <td className="px-4 py-3 text-sm text-slate-600">{lead.budget}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}><Eye className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedLead(null)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Lead Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: "Name", value: selectedLead.name },
                { label: "Company", value: selectedLead.company },
                { label: "Email", value: selectedLead.email },
                { label: "Phone", value: selectedLead.phone },
                { label: "Project Type", value: selectedLead.projectType },
                { label: "Budget", value: selectedLead.budget },
              ].map((field) => (
                <div key={field.label}>
                  <p className="text-xs text-slate-500">{field.label}</p>
                  <p className="text-sm font-medium">{field.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-500">Requirements</p>
              <p className="text-sm bg-slate-50 p-3 rounded-lg mt-1">{selectedLead.requirements}</p>
            </div>
            <Button className="mt-4 w-full" onClick={() => setSelectedLead(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
