"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  X, 
  Maximize2, 
  Minimize2,
  TableProperties,
  ArrowRight
} from "lucide-react";
import { ExpenseRecord } from "@/lib/integrations/sheets";
import { playTileSlideSound } from "@/lib/sound";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  actionTaken?: { type: string; details?: any } | null;
}

interface ExpenseChatbotProps {
  onRecordsUpdated?: (records: ExpenseRecord[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseChatbot({ onRecordsUpdated, isOpen, onClose }: ExpenseChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your **Financial AI Copilot** with live read/write access to your linked Google Sheet.\n\nYou can ask me to summarize spending, find anomalies, or make changes directly to your sheet (e.g. *\"Add ₹240 for Coffee\"*, *\"Change TXN-10023 amount to ₹500\"*, or *\"Delete TXN-10023\"*).",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    playTileSlideSound();

    try {
      const res = await fetch("/api/expenses/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionTaken: data.actionTaken,
        };
        setMessages((prev) => [...prev, botMessage]);

        // If sheet was modified and updated records returned, propagate to parent dashboard
        if (data.updatedRecords && onRecordsUpdated) {
          onRecordsUpdated(data.updatedRecords);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "Sorry, I encountered an issue accessing the Google Sheet. Please check the network or server logs.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Failed to connect to the Financial AI service.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "What is my spending breakdown by category?",
    "What was my highest single expense?",
    "Add ₹450 for Grocery on UPI",
    "How many expenses are in the Google Sheet?",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l border-parchment-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-parchment-border bg-parchment/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cobalt text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-text flex items-center gap-1.5">
              <span>Google Sheet AI Copilot</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded-full font-semibold">
                Live Sync
              </span>
            </h3>
            <p className="text-[11px] text-slate-muted">Ask questions or edit `Expenses!A:H`</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-muted hover:text-slate-text hover:bg-parchment-border/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm whitespace-pre-line leading-relaxed ${
                msg.role === "user"
                  ? "bg-cobalt text-white rounded-br-none"
                  : "bg-white text-slate-text border border-parchment-border rounded-bl-none"
              }`}
            >
              {msg.content}

              {/* Action pill if sheet was modified */}
              {msg.actionTaken && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Sheet Updated ({msg.actionTaken.type})</span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-muted bg-white border border-parchment-border p-3 rounded-2xl rounded-bl-none max-w-[70%]">
            <Sparkles className="w-3.5 h-3.5 text-cobalt animate-spin" />
            <span>Analyzing Google Sheet data...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-white border-t border-parchment-border">
        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-muted mb-2 font-semibold">
          Suggested Actions
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-[11px] bg-parchment/60 hover:bg-cobalt-light hover:text-cobalt border border-parchment-border rounded-lg px-2.5 py-1 text-slate-text transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="p-3.5 bg-white border-t border-parchment-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask or command (e.g. 'Add ₹200 for tea')..."
            className="flex-1 bg-parchment/40 border border-parchment-border rounded-xl px-3.5 py-2.5 text-xs text-slate-text focus:outline-none focus:border-cobalt transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-cobalt text-white flex items-center justify-center disabled:opacity-40 hover:bg-cobalt-hover transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

