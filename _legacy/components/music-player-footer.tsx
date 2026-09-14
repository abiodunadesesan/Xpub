"use client";

import React, { useState, useEffect } from "react";
import { Disc, Radio, Volume2, Music, ExternalLink } from "lucide-react";

export interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  genre: string;
  bpm: number;
}

export const MusicPlayerFooter: React.FC = () => {
  const [track, setTrack] = useState<TrackInfo>({
    title: "Midnight City (Obsidian Gastropub Edit)",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    albumArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300",
    genre: "Indie Electronic / Synthwave",
    bpm: 105,
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const res = await fetch("/api/now-playing");
        if (res.ok) {
          const data = await res.json();
          if (data.track) {
            setTrack(data.track);
          }
        }
      } catch (e) {
        console.warn("Spotify fetch fallback", e);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-pub-gold/30 backdrop-blur-md px-4 py-2.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Venue Audio Badge & Album Art */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-pub-amber/40 shadow-md bg-zinc-900">
            <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <Disc className="w-4 h-4 text-pub-yellow absolute inset-0 m-auto animate-spin" style={{ animationDuration: "8s" }} />
          </div>

          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
                Live Venue Audio
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">{track.genre}</span>
          </div>
        </div>

        {/* Center: Marquee Track Ticker */}
        <div className="flex-1 overflow-hidden relative max-w-2xl bg-zinc-900/60 border border-zinc-800/80 rounded-full px-4 py-1.5 flex items-center">
          <div className="flex items-center gap-2 whitespace-nowrap animate-marquee">
            <Radio className="w-3.5 h-3.5 text-pub-yellow shrink-0" />
            <span className="text-xs font-bold text-white">NOW PLAYING:</span>
            <span className="text-xs font-semibold text-pub-yellow">{track.title}</span>
            <span className="text-xs text-zinc-400">— {track.artist}</span>
            <span className="text-[11px] font-mono text-zinc-500">[{track.album}]</span>
            <span className="mx-4 text-zinc-600">•</span>
            <Radio className="w-3.5 h-3.5 text-pub-yellow shrink-0" />
            <span className="text-xs font-bold text-white">NOW PLAYING:</span>
            <span className="text-xs font-semibold text-pub-yellow">{track.title}</span>
            <span className="text-xs text-zinc-400">— {track.artist}</span>
          </div>
        </div>

        {/* Right: Soundwave Equalizer & Player Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-1 h-4">
            <span className="w-1 bg-pub-yellow rounded-full animate-bounce h-full" style={{ animationDelay: "0ms" }} />
            <span className="w-1 bg-pub-amber rounded-full animate-bounce h-[70%]" style={{ animationDelay: "150ms" }} />
            <span className="w-1 bg-pub-yellow rounded-full animate-bounce h-[90%]" style={{ animationDelay: "300ms" }} />
            <span className="w-1 bg-amber-500 rounded-full animate-bounce h-[50%]" style={{ animationDelay: "450ms" }} />
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-pub-gold/50 text-zinc-300 text-xs transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-pub-yellow" />
            <span className="hidden sm:inline text-[11px] font-mono">{track.bpm} BPM</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
