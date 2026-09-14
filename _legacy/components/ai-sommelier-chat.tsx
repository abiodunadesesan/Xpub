"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, MessageSquare, X, Send, Bot, User, RefreshCw } from "lucide-react";
import { trackEvent } from "./analytics-provider";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export const AiSommelierChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_1",
      sender: "ai",
      text: "Greetings! I'm your digital Cicerone & Sommelier at **The Obsidian XPub**. Ask me about craft beer pairings, cocktail ingredients, or live table bookings!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "What beer pairs with the Wagyu Burger?",
    "Are there any Gluten-Free beers on tap?",
    "Tell me about the Smoked Old Fashioned",
    "Do you have tables available tonight?",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    trackEvent("ai_sommelier_query", { query: text });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMsg).map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: data.message || "Apologies, I could not process your query right now.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: "ai",
          text: "I experienced a temporary connection hiccup. Feel free to re-ask or inspect our live menu!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[420px] h-[580px] bg-pub-card border border-pub-gold/40 rounded-3xl shadow-2xl shadow-pub-yellow/20 flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="p-4 bg-pub-surface border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-pub-yellow to-pub-amber flex items-center justify-center text-zinc-950 shadow-md">
            <Sparkles className="w-5 h-5" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-pub-surface" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm font-sans flex items-center gap-1.5">
              <span>Sommelier AI</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-pub-gold/20 text-pub-yellow font-semibold">
                Live Context
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">Craft Beer & Gastropub Pairing Expert</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 bg-zinc-900/60 border-b border-zinc-800/80 overflow-x-auto flex gap-2 scrollbar-none">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-zinc-800 hover:bg-pub-surface border border-zinc-700 text-pub-yellow text-xs font-medium transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "ai" && (
              <div className="w-7 h-7 rounded-lg bg-pub-amber/20 border border-pub-amber/40 text-pub-yellow flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-pub-yellow text-zinc-950 font-medium rounded-tr-none"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div
                className={`text-[10px] mt-1.5 text-right font-mono ${
                  msg.sender === "user" ? "text-zinc-800" : "text-zinc-500"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === "user" && (
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center text-xs shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-pub-amber/20 border border-pub-amber/40 text-pub-yellow flex items-center justify-center text-xs font-bold shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-zinc-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-pub-yellow" />
              <span>Analyzing live menu & brewing notes...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-pub-surface border-t border-zinc-800 flex gap-2"
      >
        <input
          type="text"
          placeholder="Ask for pairings, ingredients..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-pub-yellow rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-pub-yellow text-zinc-950 hover:bg-pub-gold font-bold text-xs flex items-center justify-center disabled:opacity-50 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
