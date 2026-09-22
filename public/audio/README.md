# Background music

The site plays the tracks in this folder. **Dropping a file in here with the
right name is the whole job** — no code change, no rebuild step, no upload.
`lib/tracks.ts` points at these paths and probes them at runtime.

| File | Track |
| --- | --- |
| `beni-al-afro-house-remix.mp3` | Beni Al (Ta Ki Seni Görene Kadar) — Afro House Remix · Ankara Echoes, Kürşad Kahraman |
| `fire-fire.mp3` | Fire Fire · Shimza, AR/CO, Kasango |

Until a file exists, the site does **not** offer a play button for it. The
player probes each path, and a track with no file is reported as unavailable —
so the corner links to the venue's Spotify playlist instead of showing a
button that would do nothing. Drop the MP3s in and the play/pause control
appears on the next load.

## Why these are not downloaded for you

Spotify serves no audio file for a track, and neither does any other streaming
service — an embed cannot autoplay, cannot loop, and plays a 30-second preview
unless the visitor is signed in. There is no legitimate way for this repository
to fetch the audio. The MP3s have to come from the venue, who own the right to
use them.

## Two things no code can change

1. **Browsers block audio until the visitor interacts.** A page cannot start
   sound on load. The site attempts playback immediately, and the first scroll,
   tap, click or key press starts it — so nobody has to hunt for a button.
2. **The first track is only known once metadata loads.** Sizes here are
   deliberately not listed in `lib/tracks.ts`; the browser reports the real
   duration, so the scrubber and remaining-time readout stay correct whatever
   file you drop in.
