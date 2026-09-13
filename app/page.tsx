"use client";

import React, { useState } from "react";
import { HeroSection } from "@/components/hero-section";
import { MenuSystem } from "@/components/menu-system";
import { ReservationSystem } from "@/components/reservation-system";
import { AiSommelierChat } from "@/components/ai-sommelier-chat";
import { MusicPlayerFooter } from "@/components/music-player-footer";
import { Sparkles, Beer, Calendar, Shield, ExternalLink, Menu, X } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-pub-dark text-white font-sans selection:bg-pub-yellow selection:text-zinc-950 pb-20">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-pub-dark/80 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pub-yellow via-pub-amber to-amber-600 flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg shadow-pub-yellow/20 group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-wider text-white group-hover:text-pub-yellow transition-colors leading-none">
                OBSIDIAN
              </span>
              <span className="text-[10px] font-mono tracking-widest text-pub-yellow font-bold uppercase">
                XPUB & GASTROKITCHEN
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-300">
            <button
              onClick={() => scrollToSection("menu-section")}
              className="hover:text-pub-yellow transition-colors"
            >
              Craft Taps & Menu
            </button>
            <button
              onClick={() => scrollToSection("reservation-section")}
              className="hover:text-pub-yellow transition-colors"
            >
              Table Booking
            </button>
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-pub-gold/50 text-pub-yellow text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Manager Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAiOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pub-card hover:bg-pub-surface border border-pub-amber/40 text-pub-yellow text-xs font-bold shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-pub-yellow animate-spin" style={{ animationDuration: "5s" }} />
              <span>AI Sommelier</span>
            </button>

            <button
              onClick={() => scrollToSection("reservation-section")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pub-yellow to-pub-amber text-zinc-950 font-bold text-xs shadow-md shadow-pub-yellow/20 hover:scale-105 transition-transform"
            >
              Book Table
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {isMobileNavOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-zinc-800 flex flex-col gap-3">
            <button
              onClick={() => {
                scrollToSection("menu-section");
                setIsMobileNavOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 text-sm font-medium"
            >
              Craft Taps & Menu
            </button>
            <button
              onClick={() => {
                scrollToSection("reservation-section");
                setIsMobileNavOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 text-sm font-medium"
            >
              Table Booking
            </button>
            <Link
              href="/admin"
              className="text-left px-3 py-2 rounded-lg text-pub-yellow hover:bg-zinc-900 text-sm font-mono font-bold flex items-center justify-between"
            >
              <span>Manager Portal (/admin)</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}
      </header>

      {/* Main Sections */}
      <main>
        <HeroSection
          onBookClick={() => scrollToSection("reservation-section")}
          onMenuClick={() => scrollToSection("menu-section")}
          onAiClick={() => setIsAiOpen(true)}
        />
        <MenuSystem />
        <ReservationSystem />
      </main>

      {/* Floating AI Sommelier Launcher Button */}
      {!isAiOpen && (
        <button
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-16 right-6 z-40 p-4 rounded-2xl bg-gradient-to-r from-pub-yellow to-pub-amber text-zinc-950 font-bold shadow-2xl shadow-pub-yellow/40 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group"
          title="Open AI Sommelier Assistant"
        >
          <Sparkles className="w-6 h-6 animate-bounce" />
          <span className="hidden sm:inline text-xs font-black uppercase tracking-wider">Ask Sommelier</span>
        </button>
      )}

      {/* AI Sommelier Chat Overlay */}
      <AiSommelierChat isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />

      {/* Sticky Marquee Venue Music Player */}
      <MusicPlayerFooter />
    </div>
  );
}
