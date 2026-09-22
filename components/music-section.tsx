"use client";

import { ExternalLink, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { Reveal, RevealGroup } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Skeleton } from "@/components/skeleton";
import { useAudioPlayer } from "@/lib/audio-player";
import { useI18n } from "@/lib/i18n/provider";
import { PLAYLIST, formatTime, genreFilters } from "@/lib/tracks";
import { useVenueMedia } from "@/lib/venue-media";

/** Enough bars to read as a waveform, few enough to stay cheap to render. */
const BAR_COUNT = 44;

/**
 * A fixed bar shape. It is a stylised level meter, not a decode of the audio —
 * the numbers that matter (position, duration) come from the element itself.
 *
 * The percentages are formatted here, once, rather than at render: the raw
 * floats format differently on the server and in the browser (50.35503814370978
 * against 50.355038%), which React reports as a hydration mismatch on every
 * one of the 44 bars.
 */
const BAR_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, index) => {
  const level = 0.3 + 0.7 * Math.abs(Math.sin(index * 1.7) * Math.cos(index * 0.55));
  return `${(level * 100).toFixed(2)}%`;
});

/** Chips are a pure function of the track list, so they're built once. */
const GENRE_FILTERS = genreFilters();

/** Three bars that bounce while a track is playing. */
function PlayingBars() {
  return (
    <span aria-hidden className="flex h-4 items-end gap-[3px]">
      {[0, 1, 2].map((bar) => (
        <motion.span
          key={bar}
          className="w-[3px] rounded-sm bg-[var(--gold)]"
          animate={{ height: ["30%", "100%", "45%"] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            repeatType: "mirror",
            delay: bar * 0.14,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

export function MusicSection() {
  const { t } = useI18n();
  const { video, isLoading } = useVenueMedia();
  const {
    tracks,
    current,
    playing,
    position,
    duration,
    playable,
    isAvailable,
    durationOf,
    select,
    toggle,
    next,
    previous,
    seek,
  } = useAudioPlayer();

  const [genre, setGenre] = useState("all");
  const visible =
    genre === "all" ? tracks : tracks.filter((track) => track.genres.includes(genre));

  const progress = duration > 0 ? Math.min(1, position / duration) : 0;
  const remaining = Math.max(0, duration - position);
  const poster = video ? undefined : "/media/venue-06.jpg";

  return (
    <section id="music" className="relative z-10 overflow-hidden py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t.music.eyebrow}
            titleTop={t.music.titleTop}
            titleBottom={t.music.titleBottom}
          />
          <p className="mt-6 max-w-3xl font-serif text-lg leading-8 text-white/80">{t.music.lead}</p>
        </Reveal>

        {/* Genre chips — derived from the tracks, so a genre nobody plays gets
            no chip, and adding a track adds its genre on its own. */}
        <Reveal delay={0.05} className="mt-8">
          <p className="glass-panel inline-flex items-center px-3.5 py-2 font-label text-[10px] text-white/60">
            {t.music.corner.eyebrow}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {GENRE_FILTERS.map((filter) => {
              const active = genre === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  data-cursor
                  aria-pressed={active}
                  onClick={() => setGenre(filter.id)}
                  className={`flex min-h-11 min-w-[8.5rem] flex-col items-start gap-0.5 rounded-full px-4 py-2.5 text-left transition sm:min-w-[9rem] ${
                    active
                      ? "bg-[var(--gold)] text-black"
                      : "glass-panel text-white hover:border-[var(--gold)]/60"
                  }`}
                >
                  <span className="font-label text-[11px]">{filter.label}</span>
                  <span
                    className={`w-full truncate font-body text-[10px] ${
                      active ? "text-black/65" : "text-white/50"
                    }`}
                  >
                    {filter.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* `items-start` so the shorter list panel hugs its content instead of
            stretching to the player card's height — an empty half-panel reads as
            something that failed to load. */}
        {/* `grid-cols-1` is load-bearing, not decoration: an implicit grid
            track sizes to the item's *min-content*, and a track row's title is
            `white-space: nowrap`, so on a phone the column measured 470px wide
            and the clipped half of the player hung off the screen. */}
        <div className="mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          {/* ——— The player ——— */}
          <Reveal
            data-testid="music-player"
            className="glass-panel flex min-w-0 flex-col p-4 sm:p-5"
          >
            <p className="font-label text-[10px] text-white/45">
              {playable ? t.music.corner.nowPlaying : t.music.corner.lastPlayed}
            </p>

            <div className="glass-card mt-3 p-4">
              {/* The room, right now — muted and looping, so the card carries
                  the same motion the rest of the site does. */}
              <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
                {isLoading && !video ? (
                  <Skeleton className="h-full w-full" />
                ) : video?.url ? (
                  <video
                    key={video.url}
                    className="h-full w-full object-cover"
                    src={video.url}
                    poster={poster}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={t.music.corner.liveFrom}
                  />
                ) : (
                  <Image
                    src="/media/venue-06.jpg"
                    alt={t.music.corner.liveFrom}
                    fill
                    sizes="(max-width: 1024px) 90vw, 45vw"
                    className="object-cover"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                <p className="absolute bottom-3 start-3 font-label text-[10px] text-white/70">
                  {t.music.corner.liveFrom}
                </p>
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-label text-[10px] text-white/45">{t.music.corner.side}</p>
                  <p className="mt-2 font-display text-lg leading-snug tracking-[0.04em] text-white">
                    {current.title}
                  </p>
                  <p className="mt-1 font-label text-[10px] text-white/50">{current.artists}</p>
                </div>
                <span
                  aria-hidden
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: current.accent }}
                />
              </div>

              <div aria-hidden className="mt-5 flex h-12 items-end gap-[2px]">
                {BAR_HEIGHTS.map((height, index) => (
                  <span
                    key={index}
                    className="flex-1 rounded-sm transition-colors duration-500"
                    style={{
                      height,
                      background:
                        index / BAR_COUNT <= progress ? "var(--gold)" : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>

              <div className="mt-2 flex items-center justify-between font-label text-[10px] text-white/50">
                <span>{formatTime(position)}</span>
                <span>-{formatTime(remaining)}</span>
              </div>

              <input
                type="range"
                className="music-scrub mt-3 w-full"
                min={0}
                max={Math.max(1, Math.floor(duration))}
                step={1}
                value={Math.floor(position)}
                onChange={(event) => seek(Number(event.target.value))}
                disabled={!playable || duration === 0}
                aria-label={t.music.corner.seek}
              />

              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  data-cursor
                  onClick={previous}
                  aria-label={t.music.corner.previous}
                  className="glass-panel inline-flex h-11 w-11 shrink-0 items-center justify-center text-white transition hover:border-[var(--gold)]/70 hover:text-[var(--gold)]"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  data-cursor
                  data-music-toggle
                  onClick={toggle}
                  disabled={!playable}
                  // Named with the track and a distinct verb: the floating pill
                  // is also "play background music", and two buttons sharing
                  // one accessible name is ambiguous for anyone navigating by
                  // role rather than sight.
                  aria-label={`${playing ? t.music.corner.pause : t.music.corner.play} — ${current.title}`}
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold)] text-black shadow-[0_0_28px_rgba(184,142,93,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {playing ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current" />
                  )}
                </button>
                <button
                  type="button"
                  data-cursor
                  onClick={next}
                  aria-label={t.music.corner.next}
                  className="glass-panel inline-flex h-11 w-11 shrink-0 items-center justify-center text-white transition hover:border-[var(--gold)]/70 hover:text-[var(--gold)]"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>
            </div>

            {current.spotify ? (
              <>
                <a
                  href={current.spotify.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor
                  className="mt-4 inline-flex items-center gap-2 font-label text-[10px] text-[var(--gold)] transition hover:text-white"
                >
                  {t.music.corner.openInSpotify}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <div className="mt-3 overflow-hidden rounded-xl">
                  <iframe
                    key={current.spotify.embed}
                    src={current.spotify.embed}
                    title={`${current.title} — Spotify`}
                    width="100%"
                    height="152"
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    className="block w-full border-0"
                  />
                </div>
                <p className="mt-2 font-body text-[11px] text-white/40">
                  {playable ? t.music.corner.bothSources : t.music.corner.spotifyOnly}
                </p>
              </>
            ) : (
              <p className="mt-4 font-serif text-sm italic text-white/55">
                {t.music.corner.bundled}
              </p>
            )}
          </Reveal>

          {/* ——— The list ——— */}
          <Reveal
            delay={0.08}
            data-testid="music-playlist"
            className="glass-panel min-w-0 p-4 sm:p-5"
          >
            <p className="font-label text-[10px] text-white/45">{t.music.corner.onRotation}</p>

            <ul className="mt-4 space-y-2">
              {visible.map((track, index) => {
                const active = current.id === track.id;
                const seconds = durationOf(track.id);
                return (
                  <li key={track.id}>
                    <button
                      type="button"
                      data-cursor
                      data-track-select
                      onClick={() => select(track.id)}
                      aria-pressed={active}
                      className={`glass-card flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                        active ? "border-[var(--gold)]/70" : ""
                      }`}
                    >
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: track.accent }}
                      />
                      <span className="min-w-0 flex-1 overflow-hidden">
                        <span className="block truncate font-body text-sm font-medium text-white">
                          {track.title}
                        </span>
                        <span className="mt-0.5 block truncate font-label text-[10px] text-white/50">
                          {track.artists}
                          {seconds ? ` · ${formatTime(seconds)}` : ""}
                          {isAvailable(track.id) ? "" : ` · ${t.music.corner.onSpotify}`}
                        </span>
                      </span>
                      {active && playing ? <PlayingBars /> : null}
                      <span className="font-label text-[10px] text-white/30">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-4 font-serif text-sm italic text-white/50">{t.music.corner.note}</p>

            {/* The venue's own playlist: the rotation above is what the site
                can talk about track by track, this is the full night. */}
            <div className="glass-card mt-4 p-4">
              <p className="font-label text-[10px] text-[var(--gold)]">
                {t.music.corner.playlistTitle}
              </p>
              <p className="mt-2 font-serif text-sm leading-6 text-white/75">
                {t.music.corner.playlistLead}
              </p>
              <div className="mt-3 overflow-hidden rounded-xl">
                <iframe
                  src={PLAYLIST.embed}
                  title={`${t.music.corner.playlistTitle} — Spotify`}
                  width="100%"
                  height="352"
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  className="block w-full border-0"
                />
              </div>
              <a
                href={PLAYLIST.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                className="mt-3 inline-flex items-center gap-2 font-label text-[10px] text-[var(--gold)] transition hover:text-white"
              >
                {t.music.corner.openPlaylist}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </Reveal>
        </div>

        {/* ——— The week ——— */}
        <RevealGroup
          className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          stagger={0.06}
        >
          {t.music.sets.map((set) => (
            <article key={set.day + set.title} className="glass-card px-5 py-6">
              <p className="font-display text-2xl tracking-[0.08em] text-[var(--gold)]">
                {set.day}
              </p>
              <h3 className="mt-3 font-body text-base font-medium text-white">{set.title}</h3>
              <p className="mt-2 font-label text-[10px] text-white/55">{set.time}</p>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
