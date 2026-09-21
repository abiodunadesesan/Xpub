/**
 * The music the site has on rotation.
 *
 * Two kinds of entry, one list:
 *
 *   • a track with a bundled `src` is real audio this site can play — the same
 *     element drives the floating pill and the corner in the live-music
 *     section, so both always agree on what is playing;
 *   • a track with a `spotify` entry can *only* be heard on Spotify. Their
 *     audio can't be embedded for playback, so the corner embeds the player
 *     for it instead of pretending to play it.
 *
 * Adding a track: drop the MP3 in `public/audio/`, add an entry here with its
 * `src`, and it appears in the corner and the playlist. A Spotify-only entry
 * just needs title, artists and the link.
 */
export type Track = {
  id: string;
  title: string;
  artists: string;
  /** Short artist name, for cramped pill and row labels. */
  label: string;
  /** File under `public/audio/`, or null when the track lives only on Spotify. */
  src: string | null;
  spotify: { url: string; embed: string } | null;
  genres: string[];
  /** Row dot colour. */
  accent: string;
};

const spotify = (id: string) => ({
  url: `https://open.spotify.com/track/${id}`,
  embed: `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`,
});

export const TRACKS: Track[] = [
  {
    id: "beni-al",
    title: "Beni Al (Ta Ki Seni Görene Kadar) — Afro House Remix",
    artists: "Ankara Echoes, Kürşad Kahraman",
    label: "Ankara Echoes",
    src: "/audio/beni-al-afro-house-remix.mp3",
    spotify: spotify("4TpofYIjlzhztvF8kWwPXi"),
    genres: ["afro-house"],
    accent: "#b88e5d",
  },
  {
    id: "fire-fire",
    title: "Fire Fire",
    artists: "Shimza, AR/CO, Kasango",
    label: "Shimza",
    src: "/audio/fire-fire.mp3",
    spotify: spotify("35dt2bP4CcBzepyufQbvYZ"),
    genres: ["afro-house"],
    accent: "#a855f7",
  },
  {
    // The site's own ambience: the bed that plays when nothing else is
    // available. Bundled, so it always works — including with no credentials
    // and no network.
    id: "site-bed",
    title: "Deep House Lounge Bar",
    artists: "En-Studio",
    label: "En-Studio",
    src: "/audio/bg-music.mp3",
    spotify: null,
    genres: ["deep-house"],
    accent: "#22d3ee",
  },
];

/** Chip labels. A genre missing here falls back to its id. */
const GENRE_LABELS: Record<string, string> = {
  "afro-house": "Afro House",
  "deep-house": "Deep House",
};

export type GenreFilter = { id: string; label: string; detail: string };

/**
 * Filter chips, derived from the tracks themselves — a genre nobody plays
 * never gets a chip.
 */
export function genreFilters(): GenreFilter[] {
  const genres = [...new Set(TRACKS.flatMap((track) => track.genres))];
  return [
    {
      id: "all",
      label: "All",
      detail: `${TRACKS.length} on rotation`,
    },
    ...genres.map((genre) => ({
      id: genre,
      label: GENRE_LABELS[genre] ?? genre,
      detail: [
        ...new Set(
          TRACKS.filter((track) => track.genres.includes(genre)).map((track) => track.label),
        ),
      ].join(", "),
    })),
  ];
}

/** `3:36` — or `--:--` until a duration is known. */
export function formatTime(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds < 0) {
    return "--:--";
  }
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
