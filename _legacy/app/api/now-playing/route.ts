import { NextResponse } from "next/server";

const VENUE_PLAYLIST = [
  {
    title: "Midnight City (Obsidian Gastropub Edit)",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    albumArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300",
    genre: "Indie Electronic / Synthwave",
    bpm: 105,
    isPlaying: true,
  },
  {
    title: "Electric Feel",
    artist: "MGMT",
    album: "Oracular Spectacular",
    albumArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300",
    genre: "Neo-Psychedelia",
    bpm: 112,
    isPlaying: true,
  },
  {
    title: "Instant Crush",
    artist: "Daft Punk ft. Julian Casablancas",
    album: "Random Access Memories",
    albumArt: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300",
    genre: "Electro-Pop",
    bpm: 110,
    isPlaying: true,
  },
  {
    title: "Redbone",
    artist: "Childish Gambino",
    album: "Awaken, My Love!",
    albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=300",
    genre: "Funk / Soul",
    bpm: 80,
    isPlaying: true,
  }
];

export async function GET() {
  try {
    // Dynamic track selection based on current minute to simulate live Spotify venue audio feed
    const currentMinute = new Date().getMinutes();
    const trackIndex = Math.floor((currentMinute / 15) % VENUE_PLAYLIST.length);
    const activeTrack = VENUE_PLAYLIST[trackIndex];

    return NextResponse.json({
      success: true,
      venue: "The Obsidian XPub Main Stage",
      status: "LIVE STREAMING",
      timestamp: new Date().toISOString(),
      track: activeTrack,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        track: VENUE_PLAYLIST[0],
      },
      { status: 500 }
    );
  }
}
