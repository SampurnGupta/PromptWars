"use client";

import React, { useState, useEffect } from "react";
import { 
  Receipt, 
  Send, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  CreditCard,
  Calendar,
  Layers,
  ArrowRight,
  Search,
  Filter,
  Download,
  Bot,
  MessageSquare
} from "lucide-react";
import { loadLocalGamificationState, recordVerticalCompletion } from "@/lib/gamification/engine";
import { ProductivityCycleState, INITIAL_CYCLE_STATE } from "@/lib/gamification/types";
import { playChoreSnapSound } from "@/lib/sound";
import { ExpenseChatbot } from "@/components/expenses/ExpenseChatbot";

interface ExpenseItem {
  transactionId: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export function ExpenseView() {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [extractedExpense, setExtractedExpense] = useState<Omit<ExpenseItem, "transactionId"> | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<ExpenseItem[]>([]);
  const [analytics, setAnalytics] = useState<{ totalAmount: number; categories: Record<string, number> }>({
    totalAmount: 0,
    categories: {},
  });
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [gamificationState, setGamificationState] = useState<ProductivityCycleState>(INITIAL_CYCLE_STATE);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const handleChatbotRecordsUpdated = (updated: ExpenseItem[]) => {
    setRecentExpenses(updated);
    const total = updated.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const cats: Record<string, number> = {};
    for (const r of updated) {
      cats[r.category] = (cats[r.category] || 0) + (Number(r.amount) || 0);
    }
    setAnalytics({ totalAmount: total, categories: cats });

    const current = loadLocalGamificationState();
    if (!current.completedVerticals.includes("expense_tracking")) {
      const recorded = recordVerticalCompletion(
        current,
        "expense_tracking",
        `AI Copilot updated Google Sheet with ${updated.length} transactions`
      );
      setGamificationState(recorded.state);
      playChoreSnapSound();
      window.dispatchEvent(new Event("gamification_updated"));
    }
  };

  const handleExportCsv = () => {
    if (recentExpenses.length === 0) return;
    const headers = "Transaction ID,Date,Description,Category,Amount,Currency,Payment Method\n";
    const rows = recentExpenses.map(r => 
      `"${r.transactionId}","${r.date}","${r.description.replace(/"/g, '""')}","${r.category}",${r.amount},"${r.currency}","${r.paymentMethod}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PromptWars_Expenses_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredExpenses = recentExpenses.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  useEffect(() => {
    setGamificationState(loadLocalGamificationState());
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses/sync");
      if (res.ok) {
        const data = await res.json();
        setRecentExpenses(data.records || []);
        setAnalytics(data.analytics || { totalAmount: 0, categories: {} });
      }
    } catch (err) {
      console.warn("Could not load expenses:", err);
    }
  };

  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your expense.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleExtract = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setExtracting(true);
    setSuccessNotice(null);

    try {
      const res = await fetch("/api/expenses/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!res.ok) throw new Error("Failed to extract");
      const data = await res.json();
      setExtractedExpense(data.extracted);
    } catch (err) {
      alert("Error extracting expense details. Please check connection.");
    } finally {
      setExtracting(false);
    }
  };

  const handleConfirmAndSync = async () => {
    if (!extractedExpense) return;
    setSyncing(true);

    try {
      const res = await fetch("/api/expenses/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extractedExpense),
      });

      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();

      // Trigger gamification completion
      const current = loadLocalGamificationState();
      const updated = recordVerticalCompletion(
        current,
        "expense_tracking",
        `Recorded ${extractedExpense.currency} ${extractedExpense.amount} for ${extractedExpense.description}`
      );
      setGamificationState(updated.state);
      playChoreSnapSound();
      window.dispatchEvent(new Event("gamification_updated"));

      setSuccessNotice(`Expense verified and synchronized to Google Sheet! (+${updated.xpAwarded} XP)`);
      setExtractedExpense(null);
      setInputText("");
      fetchExpenses();
    } catch (err) {
      alert("Failed to write to Google Sheets ledger.");
    } finally {
      setSyncing(false);
    }
  };

  const isCompleted = gamificationState.completedVerticals.includes("expense_tracking");

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Page Title & Milestone Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-parchment-border gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-wider text-cobalt font-bold">
              Productivity Vertical • Chore #2
            </span>
            {isCompleted && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Completed (+250 XP Awarded)</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-text tracking-tight">
            Natural Language Expense Tracker
          </h1>
          <p className="text-sm text-slate-muted mt-1">
            Eliminate receipt procrastination. Speak or type casual expenses to sync rows directly to Google Sheets.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <button
            onClick={() => setChatbotOpen(true)}
            className="inline-flex items-center gap-2 bg-cobalt text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-cobalt-hover hover:scale-[1.02] transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>Sheet AI Copilot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <a
            href="/"
            className="text-xs font-semibold text-cobalt hover:underline flex items-center gap-1"
          >
            <span>Return to Homepage Puzzle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {successNotice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold">{successNotice}</span>
          </div>
          <a
            href="/"
            className="text-xs font-bold text-cobalt bg-white px-3 py-1.5 rounded-md border border-emerald-200 hover:bg-emerald-50"
          >
            Check Puzzle Progress &rarr;
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Natural Language Input & AI Extraction */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-parchment-card border border-parchment-border rounded-2xl p-6 shadow-subtle">
            <h2 className="text-base font-bold text-slate-text mb-2 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-cobalt" />
              <span>Log an Expense</span>
            </h2>
            <p className="text-xs text-slate-muted mb-4">
              Enter natural language phrases like: <em>"Spent ₹350 on team lunch"</em>, <em>"Paid ₹1,200 for electricity yesterday via UPI"</em>, or <em>"Bought ₹850 groceries"</em>.
            </p>

            <form onSubmit={handleExtract} className="space-y-4">
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g. Paid ₹1,200 for electricity yesterday via UPI..."
                  rows={3}
                  className="w-full rounded-xl border border-parchment-border bg-white p-3.5 text-sm text-slate-text placeholder:text-slate-400 focus:border-cobalt focus:ring-1 focus:ring-cobalt outline-none resize-none"
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    title={isListening ? "Listening..." : "Click to speak"}
                    className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                      isListening
                        ? "bg-red-500 text-white border-red-600 animate-pulse"
                        : "bg-parchment-surface border-parchment-border text-slate-text hover:bg-parchment"
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-cobalt" />}
                  </button>
                </div>
              </div>

              {/* Quick sample chips */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="text-slate-muted self-center">Try:</span>
                {[
                  "Spent ₹450 on dinner with friends",
                  "Paid ₹1,200 for electricity yesterday via UPI",
                  "Bought ₹850 groceries at supermarket",
                  "Cab to airport ₹620 via Google Pay",
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(sample)}
                    className="bg-white border border-parchment-border px-2.5 py-1 rounded-full text-slate-text hover:border-cobalt hover:text-cobalt transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={extracting || !inputText.trim()}
                  className="flex items-center gap-2 bg-cobalt text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-cobalt-hover disabled:opacity-50 transition-colors shadow-sm"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Parsing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Extract &amp; Structure</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Extracted Preview Card */}
            {extractedExpense && (
              <div className="mt-6 p-5 rounded-xl bg-cobalt-light/60 border border-cobalt/20 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-cobalt font-bold">
                    Structured Data Verification
                  </span>
                  <span className="text-xs bg-white text-cobalt px-2 py-0.5 rounded font-mono font-semibold">
                    Ready to Write
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
                  <div className="bg-white p-2.5 rounded-lg border border-cobalt/10">
                    <span className="text-slate-muted block text-[10px]">Amount</span>
                    <span className="font-bold text-slate-text text-sm">
                      {extractedExpense.currency} {extractedExpense.amount}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-cobalt/10">
                    <span className="text-slate-muted block text-[10px]">Category</span>
                    <span className="font-bold text-slate-text text-sm">{extractedExpense.category}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-cobalt/10">
                    <span className="text-slate-muted block text-[10px]">Date</span>
                    <span className="font-bold text-slate-text text-sm">{extractedExpense.date}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-cobalt/10 col-span-2">
                    <span className="text-slate-muted block text-[10px]">Description</span>
                    <span className="font-medium text-slate-text">{extractedExpense.description}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-cobalt/10">
                    <span className="text-slate-muted block text-[10px]">Payment Method</span>
                    <span className="font-bold text-slate-text text-sm">{extractedExpense.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setExtractedExpense(null)}
                    className="text-xs text-slate-muted hover:text-slate-text font-medium px-3 py-1.5"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAndSync}
                    disabled={syncing}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
                  >
                    {syncing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Syncing to Google Sheets...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Record to Sheets (+250 XP)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-parchment-card border border-parchment-border rounded-2xl p-6 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-parchment-border gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-text flex items-center gap-2">
                  <span>Google Sheets Expense Ledger</span>
                  <span className="text-xs font-mono text-slate-muted">({filteredExpenses.length} Records)</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 text-xs font-semibold text-cobalt bg-white border border-cobalt/30 hover:bg-cobalt-light px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 text-xs">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search description or TXN ID..."
                  className="w-full bg-white border border-parchment-border rounded-lg pl-8 pr-3 py-1.5 text-slate-text outline-none focus:border-cobalt"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {["All", "Food & Dining", "Utilities", "Software & Utilities"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? "bg-cobalt text-white font-semibold"
                        : "bg-white border border-parchment-border text-slate-text hover:bg-parchment-surface"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-parchment-border text-slate-muted font-mono uppercase tracking-wider">
                    <th className="pb-2">TXN ID</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Payment</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-parchment-border">
                  {filteredExpenses.map((item) => (
                    <tr key={item.transactionId} className="hover:bg-white/60">
                      <td className="py-2.5 font-mono text-[11px] text-slate-muted">{item.transactionId}</td>
                      <td className="py-2.5 text-slate-text">{item.date}</td>
                      <td className="py-2.5 font-medium text-slate-text">{item.description}</td>
                      <td className="py-2.5">
                        <span className="bg-parchment-surface border border-parchment-border px-2 py-0.5 rounded text-[10px] font-semibold text-slate-text">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-muted">{item.paymentMethod}</td>
                      <td className="py-2.5 font-mono font-bold text-slate-text text-right">
                        {item.currency} {item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Dashboard Metrics */}
        <div className="space-y-6">
          <div className="bg-parchment-card border border-parchment-border rounded-2xl p-6 shadow-subtle">
            <h3 className="text-sm font-bold text-slate-text mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cobalt" />
              <span>Spending Dashboard</span>
            </h3>

            <div className="bg-white rounded-xl p-4 border border-parchment-border mb-4">
              <span className="text-xs text-slate-muted block">Total Recorded Expenditure</span>
              <div className="text-2xl font-extrabold text-cobalt mt-1">
                ₹ {analytics.totalAmount.toLocaleString()}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-text block">Category Distribution</span>
              {Object.entries(analytics.categories).map(([cat, amt]) => {
                const percentage = analytics.totalAmount > 0 ? (amt / analytics.totalAmount) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-text font-medium">{cat}</span>
                      <span className="font-mono text-slate-muted">₹{amt.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-parchment-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cobalt rounded-full"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-parchment-border rounded-2xl p-5 text-xs text-slate-muted space-y-2">
            <div className="flex items-center gap-2 text-slate-text font-bold">
              <CreditCard className="w-4 h-4 text-cobalt" />
              <span>Integration Status</span>
            </div>
            <p>
              Writes are persisted to the backend Google Sheets client. Verification is confirmed before awarding gamification points.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Copilot Launcher Button */}
      <button
        onClick={() => setChatbotOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-cobalt text-white px-4 py-3 rounded-full shadow-floating hover:bg-cobalt-hover hover:scale-105 transition-all flex items-center gap-2 text-xs font-bold border border-white/20"
      >
        <Bot className="w-4 h-4" />
        <span>Ask Sheet Copilot</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Financial AI Copilot Drawer */}
      <ExpenseChatbot
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        onRecordsUpdated={handleChatbotRecordsUpdated}
      />
    </div>
  );
}

