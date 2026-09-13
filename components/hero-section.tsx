"use client";

import React from "react";
import { Sparkles, Calendar, Beer, ChevronDown, Flame, ShieldCheck } from "lucide-react";
import { trackEvent } from "./analytics-provider";

interface HeroSectionProps {
  onBookClick: () => void;
  onMenuClick: () => void;
  onAiClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBookClick,
  onMenuClick,
  onAiClick,
}) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 pt-20 pb-16 overflow-hidden bg-pub-dark border-b border-pub-gold/20">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pub-amber/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-pub-yellow/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Live Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pub-card/90 border border-pub-gold/30 text-pub-yellow text-xs font-semibold uppercase tracking-widest shadow-lg shadow-pub-amber/10 mb-8 backdrop-blur-md animate-pulse-slow">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Open Now • 12 Craft Taps Flowing</span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-6 font-sans">
          THE OBSIDIAN{" "}
          <span className="bg-gradient-to-r from-pub-yellow via-pub-amber to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
            XPUB
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-zinc-400 font-normal leading-relaxed mb-10">
          Where artisanal craft brewing meets dry-aged gastronomy. Experience real-time tap syncing, transactional table reservations, and an integrated AI sommelier.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-16">
          <button
            onClick={() => {
              trackEvent("click_hero_book");
              onBookClick();
            }}
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-pub-yellow to-pub-amber text-zinc-950 font-bold text-base shadow-xl shadow-pub-amber/20 hover:shadow-pub-yellow/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Calendar className="w-5 h-5 text-zinc-950" />
            <span>Reserve a Table</span>
          </button>

          <button
            onClick={() => {
              trackEvent("click_hero_menu");
              onMenuClick();
            }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-pub-card hover:bg-pub-surface border border-zinc-800 hover:border-pub-gold/50 text-white font-semibold text-base transition-all duration-200"
          >
            <Beer className="w-5 h-5 text-pub-yellow" />
            <span>View Live Taps & Menu</span>
          </button>

          <button
            onClick={() => {
              trackEvent("click_hero_ai");
              onAiClick();
            }}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-pub-amber/30 text-pub-yellow text-sm font-medium transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-pub-yellow animate-spin" style={{ animationDuration: "6s" }} />
            <span>Ask AI Sommelier</span>
          </button>
        </div>

        {/* Feature Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-6 border-t border-zinc-800/80">
          <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/50">
            <Flame className="w-5 h-5 text-pub-amber" />
            <span className="text-sm font-medium text-zinc-300">45-Day Dry Aged Wagyu</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/50">
            <Beer className="w-5 h-5 text-pub-yellow" />
            <span className="text-sm font-medium text-zinc-300">Real-Time Tap Syncing</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/50">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-300">Zero Overbooking Engine</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-500 text-xs">
        <span>Scroll to Explore</span>
        <ChevronDown className="w-4 h-4 animate-bounce text-pub-gold" />
      </div>
    </section>
  );
};
