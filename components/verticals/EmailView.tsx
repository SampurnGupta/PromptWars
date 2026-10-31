"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Star, 
  Eye, 
  AlertCircle, 
  Send,
  Calendar,
  Clock,
  ArrowRight
} from "lucide-react";
import { loadLocalGamificationState, recordVerticalCompletion } from "@/lib/gamification/engine";
import { ProductivityCycleState, INITIAL_CYCLE_STATE } from "@/lib/gamification/types";

interface EmailItem {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  date: string;
  isImportant?: boolean;
  classification?: "important" | "unnecessary" | "neutral";
  actionRequired?: string;
  deadline?: string;
  reason?: string;
  isStarred?: boolean;
  isRead?: boolean;
}

export function EmailView() {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [processedSummary, setProcessedSummary] = useState<any | null>(null);
  const [gamificationState, setGamificationState] = useState<ProductivityCycleState>(INITIAL_CYCLE_STATE);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setGamificationState(loadLocalGamificationState());
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/email/fetch");
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
      }
    } catch (err) {
      console.warn("Error fetching emails:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessEmails = async () => {
    setProcessing(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/email/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailIds: emails.map(e => e.id) }),
      });

      if (!res.ok) throw new Error("Processing failed");
      const data = await res.json();
      setEmails(data.classifiedEmails || []);

      const actionItems = (data.classifiedEmails || [])
        .filter((e: any) => e.classification === "important" && e.actionRequired)
        .map((e: any) => ({
          task: e.actionRequired,
          deadline: e.deadline,
          sender: e.sender,
        }));

      const summaryPayload = {
        totalAnalyzed: data.totalAnalyzed,
        unnecessaryMarkedRead: data.markedReadCount,
        importantStarred: data.starredCount,
        actionRequiredItems: actionItems,
      };

      setProcessedSummary(summaryPayload);

      // Deliver digest through Gmail API
      setDelivering(true);
      await fetch("/api/email/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(summaryPayload),
      });
      setDelivering(false);

      // Trigger gamification completion
      const current = loadLocalGamificationState();
      const updated = recordVerticalCompletion(
        current,
        "email_management",
        `Cleaned ${data.totalAnalyzed} emails (${data.markedReadCount} read, ${data.starredCount} starred) and dispatched digest.`
      );
      setGamificationState(updated.state);
      window.dispatchEvent(new Event("gamification_updated"));

      setStatusMessage(`Email cleanup successfully executed & digest dispatched! (+${updated.xpAwarded} XP)`);
    } catch (err) {
      alert("Error executing email cleanup. Please check network.");
    } finally {
      setProcessing(false);
      setDelivering(false);
    }
  };

  const isCompleted = gamificationState.completedVerticals.includes("email_management");

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-parchment-border gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-wider text-cobalt font-bold">
              Productivity Vertical • Chore #1
            </span>
            {isCompleted && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Completed (+250 XP Awarded)</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-text tracking-tight">
            Email Inbox Management &amp; Intelligence
          </h1>
          <p className="text-sm text-slate-muted mt-1">
            Automate inbox zero: AI stars critical deadlines, silences marketing spam as read, and sends a tidy digest.
          </p>
        </div>

        <a
          href="/"
          className="text-xs font-semibold text-cobalt hover:underline flex items-center gap-1 self-start"
        >
          <span>Return to Homepage Puzzle</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold">{statusMessage}</span>
          </div>
          <a
            href="/"
            className="text-xs font-bold text-cobalt bg-white px-3 py-1.5 rounded-md border border-emerald-200 hover:bg-emerald-50"
          >
            View Assembled Quadrant &rarr;
          </a>
        </div>
      )}

      {/* Action Banner */}
      <div className="bg-parchment-card border border-parchment-border rounded-2xl p-6 shadow-subtle mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-text">
            Primary Inbox Status: {emails.length} Unread Messages
          </h2>
          <p className="text-xs text-slate-muted mt-0.5">
            Operating safely on configured Google Demo Mailbox with read/star permissions only.
          </p>
        </div>

        <button
          onClick={handleProcessEmails}
          disabled={processing || emails.length === 0}
          className="flex items-center gap-2 bg-cobalt text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-cobalt-hover disabled:opacity-50 transition-colors shadow-sm"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{delivering ? "Dispatching Gmail Digest..." : "Classifying & Starring via AI..."}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Start Automated Email Cleanup (+250 XP)</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Digest Card if Processed */}
      {processedSummary && (
        <div className="mb-8 p-6 rounded-2xl bg-white border-2 border-emerald-500 shadow-card animate-fade-in">
          <div className="flex items-center justify-between border-b border-parchment-border pb-3 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-text text-base">Verified Cleanup Summary</h3>
            </div>
            <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded font-semibold">
              Delivered to Gmail
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-parchment-surface p-3 rounded-xl border border-parchment-border">
              <span className="text-[11px] text-slate-muted block">Emails Scanned</span>
              <span className="text-xl font-extrabold text-slate-text">{processedSummary.totalAnalyzed}</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <span className="text-[11px] text-emerald-700 block">Marked Read (Spam/Promos)</span>
              <span className="text-xl font-extrabold text-emerald-800">{processedSummary.unnecessaryMarkedRead}</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <span className="text-[11px] text-amber-700 block">Starred (Deadlines/Actions)</span>
              <span className="text-xl font-extrabold text-amber-800">{processedSummary.importantStarred}</span>
            </div>
          </div>

          {processedSummary.actionRequiredItems.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-text uppercase tracking-wider block mb-2 font-mono">
                Extracted Action Items &amp; Deadlines:
              </span>
              <div className="space-y-2">
                {processedSummary.actionRequiredItems.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-parchment-surface border border-parchment-border text-xs">
                    <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 fill-amber-500" />
                    <div>
                      <span className="font-semibold text-slate-text">{item.task}</span>
                      {item.deadline && (
                        <span className="ml-2 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                          Due: {item.deadline}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-muted block mt-0.5">From: {item.sender}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Inbox Listing */}
      <div className="bg-parchment-card border border-parchment-border rounded-2xl p-6 shadow-subtle">
        <h3 className="text-sm font-bold text-slate-text mb-4 flex items-center justify-between">
          <span>Target Inbox Messages</span>
          <span className="text-xs font-mono text-slate-muted">{emails.length} Items</span>
        </h3>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-muted text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-cobalt mb-2" />
            <span>Fetching emails from Gmail...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => {
              const isStarred = email.isStarred || email.classification === "important";
              const isRead = email.isRead || email.classification === "unnecessary";

              return (
                <div
                  key={email.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isStarred
                      ? "bg-amber-50/70 border-amber-300"
                      : isRead
                      ? "bg-white/40 border-parchment-border opacity-70"
                      : "bg-white border-parchment-border hover:border-cobalt/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {isStarred ? (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Mail className="w-4 h-4 text-slate-muted flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-text">{email.sender}</span>
                          {email.classification && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase font-mono ${
                                email.classification === "important"
                                  ? "bg-amber-100 text-amber-900 font-bold"
                                  : email.classification === "unnecessary"
                                  ? "bg-slate-200 text-slate-700"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {email.classification}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-text mt-0.5">{email.subject}</h4>
                        <p className="text-xs text-slate-muted line-clamp-2 mt-1">{email.snippet}</p>

                        {email.actionRequired && (
                          <div className="mt-2 text-[11px] text-amber-900 font-medium flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Action: {email.actionRequired}</span>
                            {email.deadline && <span className="font-bold">({email.deadline})</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-muted whitespace-nowrap">
                      {email.date ? new Date(email.date).toLocaleDateString() : "Recent"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

