import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Trash2, BookOpen } from "lucide-react";

const categories = [
  { value: "about", label: "About" },
  { value: "skills", label: "Skills" },
  { value: "services", label: "Services" },
  { value: "faq", label: "FAQ" },
  { value: "projects", label: "Projects" },
];

const demoKb = [
  { id: 1, category: "about", questionEn: "Who is Nikhil?", questionZh: "Nikhil 是誰？", answerEn: "Nikhil is a technology enthusiast passionate about AI Automation, Web Development, and Cybersecurity.", answerZh: "Nikhil 是一位熱愛 AI 自動化、網頁開發和網路安全的科技愛好者。", keywords: ["who", "nikhil", "about"], priority: 10 },
  { id: 2, category: "skills", questionEn: "What skills does Nikhil have?", questionZh: "Nikhil 有哪些技能？", answerEn: "Web Development (HTML, CSS, JS), Cybersecurity, and AI Automation (Chatbots, Workflow Automation).", answerZh: "網頁開發（HTML、CSS、JS）、網路安全、AI 自動化（聊天機器人、工作流程自動化）。", keywords: ["skills", "can do"], priority: 10 },
  { id: 3, category: "services", questionEn: "What services does Nikhil offer?", questionZh: "Nikhil 提供什麼服務？", answerEn: "Website Development, AI Chatbots, Workflow Automation, AI Integration, Business Consulting, LINE Integration.", answerZh: "網站開發、AI 聊天機器人、工作流程自動化、AI 整合、商業諮詢、LINE 整合。", keywords: ["services", "offer"], priority: 10 },
  { id: 4, category: "faq", questionEn: "How can I contact Nikhil?", questionZh: "如何聯繫 Nikhil？", answerEn: "You can contact Nikhil through this chat! I can help collect your project requirements or schedule a consultation.", answerZh: "您可以透過這個聊天聯繫 Nikhil！我可以幫助收集您的專案需求或安排諮詢。", keywords: ["contact", "reach"], priority: 9 },
  { id: 5, category: "faq", questionEn: "How do I book a consultation?", questionZh: "如何預約諮詢？", answerEn: "Tell me you'd like to schedule a meeting, or click 'Book Consultation' from the menu below!", answerZh: "告訴我您想安排會面，或從下方選單點擊「預約諮詢」！", keywords: ["book", "consultation"], priority: 9 },
  { id: 6, category: "projects", questionEn: "What projects has Nikhil built?", questionZh: "Nikhil 做過什麼專案？", answerEn: "Nikhil AI Assistant (this chatbot!), LINE Business Integrations, Web Applications, Automation Workflows.", answerZh: "Nikhil AI Assistant（這個聊天機器人！）、LINE 商業整合、網頁應用、自動化工作流程。", keywords: ["projects", "portfolio"], priority: 8 },
  { id: 7, category: "skills", questionEn: "Can Nikhil build websites?", questionZh: "Nikhil 會做網站嗎？", answerEn: "Yes! Nikhil builds modern, responsive websites using HTML, CSS, and JavaScript.", answerZh: "會的！Nikhil 使用 HTML、CSS 和 JavaScript 構建現代化響應式網站。", keywords: ["website", "build"], priority: 9 },
  { id: 8, category: "skills", questionEn: "Can Nikhil create chatbots?", questionZh: "Nikhil 會做聊天機器人嗎？", answerEn: "Absolutely! Nikhil specializes in LINE-integrated AI chatbots using OpenAI.", answerZh: "當然！Nikhil 專門使用 OpenAI 構建 LINE 整合的 AI 聊天機器人。", keywords: ["chatbot", "bot"], priority: 9 },
];

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [items, setItems] = useState(demoKb);
  const [form, setForm] = useState({ category: "faq" as const, questionEn: "", questionZh: "", answerEn: "", answerZh: "", keywords: "" });

  const filtered = items.filter((item) => {
    const matchesSearch = !search || item.questionEn?.toLowerCase().includes(search.toLowerCase()) || item.answerEn?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setItems([...items, { id: items.length + 1, ...form, keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean), priority: 0, isActive: true }]);
    setForm({ category: "faq", questionEn: "", questionZh: "", answerEn: "", answerZh: "", keywords: "" });
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Knowledge Base</h1>
          <p className="text-slate-500">Manage AI knowledge entries ({items.length} entries)</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Add Entry
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12"><BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-slate-400">No entries found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">{item.category}</Badge>
                      {item.priority > 0 && <Badge className="bg-amber-100 text-amber-800">Priority {item.priority}</Badge>}
                    </div>
                    <p className="font-medium text-slate-800">{item.questionEn || item.questionZh}</p>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.answerEn || item.answerZh}</p>
                    {item.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.keywords.map((kw: string) => <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>)}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setItems(items.filter((i) => i.id !== item.id))}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsCreateOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Add Knowledge Base Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-1">
                  {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium text-slate-700">Question (EN) *</label><Input value={form.questionEn} onChange={(e) => setForm((f) => ({ ...f, questionEn: e.target.value }))} required className="mt-1" /></div>
              <div><label className="text-sm font-medium text-slate-700">Question (ZH)</label><Input value={form.questionZh} onChange={(e) => setForm((f) => ({ ...f, questionZh: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-sm font-medium text-slate-700">Answer (EN) *</label><Textarea value={form.answerEn} onChange={(e) => setForm((f) => ({ ...f, answerEn: e.target.value }))} required rows={3} className="mt-1" /></div>
              <div><label className="text-sm font-medium text-slate-700">Answer (ZH) *</label><Textarea value={form.answerZh} onChange={(e) => setForm((f) => ({ ...f, answerZh: e.target.value }))} required rows={3} className="mt-1" /></div>
              <div><label className="text-sm font-medium text-slate-700">Keywords (comma separated)</label><Input value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} placeholder="e.g. website, pricing, cost" className="mt-1" /></div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Create Entry</Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
