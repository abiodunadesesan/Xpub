"use client";

import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { spotifyTrack } from "@/lib/spotify";
import { useI18n } from "@/lib/i18n/provider";

type SpotifyEmbedController = {
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  addListener: (
    event: string,
    cb: (e: {
      data: {
        isPaused?: boolean;
        isBuffering?: boolean;
        duration?: number;
        position?: number;
      };
    }) => void,
  ) => void;
};

type SpotifyIFrameApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: number | string; height?: number | string },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameApi) => void;
    __xpubSpotifyReady?: (api: SpotifyIFrameApi) => void;
  }
}

/**
 * Single control: play / pause icon + status label.
 * Full Spotify track, restarts at end until the user pauses.
 */
export function BackgroundMusic() {
  const { t } = useI18n();
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const shouldPlay = useRef(true);
  const userPaused = useRef(false);
  const restarting = useRef(false);

  const tryPlay = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || userPaused.current || !shouldPlay.current) return false;
    try {
      controller.play();
      setPlaying(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const restartTrack = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || userPaused.current || !shouldPlay.current) return;
    if (restarting.current) return;
    restarting.current = true;
    try {
      controller.seek(0);
      controller.play();
      setPlaying(true);
    } catch {
      tryPlay();
    }
    window.setTimeout(() => {
      restarting.current = false;
    }, 1500);
  }, [tryPlay]);

  useEffect(() => {
    let cancelled = false;

    const boot = (IFrameAPI: SpotifyIFrameApi) => {
      if (cancelled || !hostRef.current || controllerRef.current) return;

      IFrameAPI.createController(
        hostRef.current,
        { uri: spotifyTrack.uri, width: 320, height: 80 },
        (controller) => {
          if (cancelled) return;
          controllerRef.current = controller;
          setReady(true);

          controller.addListener("playback_update", (event) => {
            const { isPaused, isBuffering, duration = 0, position = 0 } = event.data;
            const isPlaying = !Boolean(isPaused);
            setPlaying(isPlaying);

            if (userPaused.current || !shouldPlay.current) return;

            if (duration > 0 && position > 0 && duration - position < 1500) {
              restartTrack();
              return;
            }

            if (isPaused && !isBuffering) {
              window.setTimeout(() => {
                if (userPaused.current || !shouldPlay.current) return;
                restartTrack();
              }, 400);
            }
          });

          [400, 1000, 2500].forEach((ms) => {
            window.setTimeout(() => tryPlay(), ms);
          });
        },
      );
    };

    window.__xpubSpotifyReady = boot;
    window.onSpotifyIframeApiReady = (api) => window.__xpubSpotifyReady?.(api);

    if (!document.querySelector('script[data-xpub-spotify="1"]')) {
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      script.dataset.xpubSpotify = "1";
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [restartTrack, tryPlay]);

  useEffect(() => {
    if (!ready) return;

    const unlock = (event: Event) => {
      if (userPaused.current) return;
      // Don't fight the pause button — toggle handles that click
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-music-toggle]")) return;
      shouldPlay.current = true;
      tryPlay();
    };

    const opts: AddEventListenerOptions = { capture: true };
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("keydown", unlock, opts);
    window.addEventListener("touchstart", unlock, opts);
    window.addEventListener("wheel", unlock, { capture: true, once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock, opts);
      window.removeEventListener("keydown", unlock, opts);
      window.removeEventListener("touchstart", unlock, opts);
      window.removeEventListener("wheel", unlock, true);
    };
  }, [ready, tryPlay]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (userPaused.current || !shouldPlay.current) return;
      if (!playing) tryPlay();
    }, 3000);
    return () => window.clearInterval(id);
  }, [playing, tryPlay]);

  const toggle = () => {
    const controller = controllerRef.current;
    if (!controller) return;

    if (playing) {
      userPaused.current = true;
      shouldPlay.current = false;
      controller.pause();
      setPlaying(false);
      return;
    }

    userPaused.current = false;
    shouldPlay.current = true;
    try {
      controller.seek(0);
    } catch {
      /* ignore */
    }
    tryPlay();
  };

  return (
    <>
      <div
        className="pointer-events-none fixed bottom-0 left-0 z-0 overflow-hidden"
        style={{ width: 320, height: 80, opacity: 0.02 }}
        aria-hidden
      >
        <div ref={hostRef} className="h-20 w-80" />
      </div>

      <div className="fixed bottom-5 left-5 z-[85] flex items-center gap-2">
        <button
          type="button"
          data-cursor
          data-music-toggle
          onClick={toggle}
          disabled={!ready}
          aria-label={playing ? t.ui.pauseMusic : t.ui.playMusic}
          title={`${playing ? t.ui.pauseMusic : t.ui.playMusic} · ${spotifyTrack.title}`}
          className="glass-btn inline-flex h-12 w-12 shrink-0 items-center justify-center text-black shadow-[0_0_24px_rgba(184,142,93,0.35)] transition hover:brightness-110 disabled:opacity-40"
        >
          {playing ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
        </button>
        <button
          type="button"
          data-cursor
          data-music-toggle
          onClick={toggle}
          disabled={!ready}
          className="glass-panel hidden max-w-[14rem] truncate px-3 py-2 text-left font-label text-[10px] uppercase tracking-[0.16em] text-white/80 transition hover:text-[var(--gold)] disabled:opacity-40 sm:inline"
        >
          {playing ? t.ui.nowPlaying : t.ui.tapToPlay} · Afro House
        </button>
      </div>
    </>
  );
}
