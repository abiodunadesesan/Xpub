"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { TRACKS, type Track } from "@/lib/tracks";

/**
 * What the site knows about one track's audio.
 *
 * `available` comes from probing the file, not from assuming it: a track whose
 * MP3 hasn't been bundled yet must not be offered as playable, and a track
 * whose file *is* there must be playable without the visitor doing anything
 * special.
 */
type TrackStatus = { available: boolean; duration: number | null };

type AudioPlayer = {
  tracks: Track[];
  /** Index into `tracks` — the current selection, playable or not. */
  index: number;
  current: Track;
  playing: boolean;
  /** Seconds into the current track; 0 when it isn't playing from the site. */
  position: number;
  duration: number;
  /** True when the site has this track's file and can play it. */
  playable: boolean;
  /**
   * False when *no* track is bundled. The controls read this so they can send
   * a visitor to Spotify instead of offering a play button that would do
   * nothing — which is the state the site is in until the MP3s are added.
   */
  hasPlayableTrack: boolean;
  isAvailable: (id: string) => boolean;
  durationOf: (id: string) => number | null;
  select: (id: string) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
};

const AudioPlayerContext = createContext<AudioPlayer | null>(null);

/**
 * The whole site's audio, in one element.
 *
 * A single source of truth is the point: the floating pill and the corner in
 * the live-music section are two views of this, so they can't disagree about
 * what's playing, and starting music from one place doesn't fight the other.
 *
 * Playback rules, in order of who wins:
 *
 *   1. An explicit pause stops playback and nothing resumes over it — not the
 *      watchdog, not a scroll, not selecting a track.
 *   2. Autoplay is attempted on mount. Browsers block it until the visitor has
 *      interacted, which no code can bypass; the first tap, key press, scroll
 *      or touch anywhere starts playback, so no one has to find a button.
 *   3. Browsers also suspend audio in hidden tabs, so a watchdog resumes
 *      anything we didn't pause ourselves.
 */
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  /**
   * Only what the visitor picked. Until they pick something the player follows
   * the first track the site can actually play — derived rather than stored, so
   * arriving at that answer doesn't need a state update in an effect.
   */
  const [selected, setSelected] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<Record<string, TrackStatus>>({});
  /** Set only by an explicit pause. */
  const userPaused = useRef(false);

  /** Indexes the site can actually play, in list order. */
  const playableIndexes = useMemo(
    () =>
      TRACKS.map((track, position) => (status[track.id]?.available ? position : -1)).filter(
        (position) => position >= 0,
      ),
    [status],
  );

  const index = selected ?? playableIndexes[0] ?? 0;
  const current = TRACKS[index] ?? TRACKS[0]!;
  const playable = status[current.id]?.available === true;

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || userPaused.current || !playable) return;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      // Autoplay policy — the gesture listeners below retry.
      setPlaying(false);
    }
  }, [playable]);

  /**
   * Probe every track once, by asking the browser to read its metadata. That
   * single request answers both questions — whether the file is really there
   * (a missing one fires `error`) and how long it is — so a track that isn't
   * bundled yet is reported as unavailable instead of offered as a play button
   * with nothing behind it. Loading metadata is also far cheaper than loading
   * the audio: it does not download the file.
   */
  useEffect(() => {
    let cancelled = false;

    const probe = (track: Track): Promise<TrackStatus> => {
      if (!track.src) return Promise.resolve({ available: false, duration: null });

      return new Promise((resolve) => {
        const audio = new Audio();
        audio.preload = "metadata";
        audio.onloadedmetadata = () =>
          resolve({
            available: true,
            duration: Number.isFinite(audio.duration) ? audio.duration : null,
          });
        audio.onerror = () => resolve({ available: false, duration: null });
        audio.src = track.src!;
      });
    };

    void (async () => {
      const entries = await Promise.all(
        TRACKS.map(async (track) => [track.id, await probe(track)] as const),
      );
      if (!cancelled) setStatus(Object.fromEntries(entries));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Autoplay attempt, and the unlock listeners that pick up where it failed.
  useEffect(() => {
    if (!playable || userPaused.current) return;
    void tryPlay();

    if (playing) return;
    const unlock = (event: Event) => {
      if (userPaused.current) return;
      const target = event.target as HTMLElement | null;
      // Controls handle their own clicks; don't double-handle them.
      if (target?.closest("[data-music-toggle]") || target?.closest("[data-track-select]")) {
        return;
      }
      void tryPlay();
    };

    const options: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener("pointerdown", unlock, options);
    window.addEventListener("keydown", unlock, options);
    window.addEventListener("touchstart", unlock, options);
    window.addEventListener("wheel", unlock, options);

    return () => {
      window.removeEventListener("pointerdown", unlock, options);
      window.removeEventListener("keydown", unlock, options);
      window.removeEventListener("touchstart", unlock, options);
      window.removeEventListener("wheel", unlock, options);
    };
  }, [playable, playing, tryPlay]);

  // Browsers suspend audio in hidden tabs and can pause it without telling us.
  useEffect(() => {
    const id = window.setInterval(() => {
      const audio = audioRef.current;
      if (!audio || userPaused.current || !playable) return;
      if (audio.paused) void tryPlay();
    }, 4_000);
    return () => window.clearInterval(id);
  }, [playable, tryPlay]);

  const step = useCallback(
    (direction: 1 | -1) => {
      if (playableIndexes.length === 0) return;
      const at = playableIndexes.indexOf(index);
      const target =
        at === -1
          ? playableIndexes[direction === 1 ? 0 : playableIndexes.length - 1]!
          : playableIndexes[(at + direction + playableIndexes.length) % playableIndexes.length]!;

      userPaused.current = false;
      setPosition(0);
      setSelected(target);
    },
    [index, playableIndexes],
  );

  const select = useCallback(
    (id: string) => {
      const target = TRACKS.findIndex((track) => track.id === id);
      if (target === -1) return;

      setPosition(0);
      setSelected(target);
      userPaused.current = false;

      // Selecting a track the site can't play (Spotify-only) must stop our own
      // audio rather than play underneath it — otherwise the embed and the site
      // are both making noise.
      if (!status[id]?.available) {
        const audio = audioRef.current;
        if (audio) {
          userPaused.current = true;
          audio.pause();
          setPlaying(false);
        }
      }
    },
    [status],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      userPaused.current = true;
      audio.pause();
      setPlaying(false);
      return;
    }

    userPaused.current = false;
    try {
      audio.currentTime = 0;
    } catch {
      /* not seekable yet */
    }
    void tryPlay();
  }, [tryPlay]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(seconds, audio.duration));
    setPosition(audio.currentTime);
  }, []);

  const onEnded = useCallback(() => {
    // A single playable track loops rather than playing once and stopping.
    if (playableIndexes.length <= 1) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        void audio.play().catch(() => setPlaying(false));
      }
      return;
    }
    step(1);
  }, [playableIndexes.length, step]);

  const value = useMemo<AudioPlayer>(
    () => ({
      tracks: TRACKS,
      index,
      current,
      playing,
      position,
      duration,
      playable,
      hasPlayableTrack: playableIndexes.length > 0,
      isAvailable: (id) => status[id]?.available === true,
      durationOf: (id) => status[id]?.duration ?? null,
      select,
      toggle,
      next: () => step(1),
      previous: () => step(-1),
      seek,
    }),
    [
      current,
      duration,
      index,
      playable,
      playableIndexes.length,
      playing,
      position,
      select,
      seek,
      status,
      step,
      toggle,
    ],
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        // No source at all for a track we can't play, so the element can't
        // quietly keep the previous track loaded behind a "now playing" label.
        src={playable ? current.src ?? undefined : undefined}
        autoPlay
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onEnded={onEnded}
        aria-hidden
        tabIndex={-1}
      />
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return ctx;
}
