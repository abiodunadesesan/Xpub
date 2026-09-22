"use client";

import { ExternalLink, Pause, Play } from "lucide-react";
import { useAudioPlayer } from "@/lib/audio-player";
import { useI18n } from "@/lib/i18n/provider";
import { PLAYLIST } from "@/lib/tracks";

/**
 * The ambient music control.
 *
 * A view onto `AudioPlayerProvider`, not a player of its own: the element, the
 * autoplay unlock and the resume watchdog all live there, so the pill and the
 * corner in the live-music section can never disagree about what is playing.
 *
 * The one case it handles itself is having no audio at all. The rotation is
 * Spotify tracks, and Spotify does not hand out audio files, so until the MP3s
 * are added there is nothing this element could play — a play button that does
 * nothing reads as a broken site. It points at the playlist instead.
 */
export function BackgroundMusic() {
  const { t } = useI18n();
  const { current, playing, toggle, hasPlayableTrack } = useAudioPlayer();

  if (!hasPlayableTrack) {
    return (
      <div className="fixed bottom-5 end-5 z-[85]">
        <a
          href={PLAYLIST.url}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor
          title={t.ui.listenOnSpotify}
          className="glass-btn inline-flex min-h-12 items-center gap-2 px-4 text-black shadow-[0_0_24px_rgba(184,142,93,0.35)] transition hover:brightness-110"
        >
          <Play className="h-4 w-4 fill-current" />
          <span className="font-label text-[10px]">{t.ui.listenOnSpotify}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  const action = playing ? t.ui.pauseMusic : t.ui.playMusic;

  return (
    <div className="fixed bottom-5 end-5 z-[85] flex items-center gap-2">
      <button
        type="button"
        data-cursor
        data-music-toggle
        onClick={toggle}
        aria-label={action}
        title={`${action} · ${current.title}`}
        className="glass-btn inline-flex h-12 w-12 shrink-0 items-center justify-center text-black shadow-[0_0_24px_rgba(184,142,93,0.35)] transition hover:brightness-110"
      >
        {playing ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current" />
        )}
      </button>

      {/* Jumps to the corner that shows the full track, the waveform and the
          Spotify embed — where the rest of the controls are. */}
      <button
        type="button"
        data-cursor
        onClick={() =>
          document.getElementById("music")?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        title={`${current.title} — ${current.artists}`}
        className="glass-panel hidden max-w-[14rem] truncate px-3 py-2 text-left font-label text-[10px] text-white/80 transition hover:border-[var(--gold)]/60 hover:text-[var(--gold)] sm:inline"
      >
        {playing ? t.ui.nowPlaying : t.ui.tapToPlay} · {current.label}
      </button>
    </div>
  );
}
