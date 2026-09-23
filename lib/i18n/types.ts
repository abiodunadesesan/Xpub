export type Dictionary = {  brand: {
    name: string; short: string; city: string; tagline: string };
  nav: { about: string; experience: string; menu: string; gallery: string; music: string; blog: string; visit: string };
  hero: {
    eyebrow: string;
    logo: string;
    logoSub: string;
    headlineTop: string;
    headlineBottom: string;
    paragraphs: [string, string];
    cta: string;
  };
  about: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    paragraphs: [string, string, string];
    rating: string;
  };
  experiences: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    items: Array<{
      id: string;
      icon: string;
      time: string;
      title: string;
      body: string;
      bullets: [string, string, string, string];
    }>;
  };
  menu: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    tabs: Array<{ id: "cocktails" | "beer" | "nights"; label: string }>;
    categories: Record<
      "cocktails" | "beer" | "nights",
      Array<{ name: string; detail: string; price: string }>
    >;
    note: string;
  };
  gallery: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    /**
     * Counts line above the grid. A template rather than a sentence because
     * the numbers move: `{moments} and {clips}` are substituted, so a language
     * that counts or orders them differently can say so.
     */
    summary: string;
    /** Hover label on a clip tile. */
    open: string;
    /** Hover label on a photo tile. */
    view: string;
  };
  music: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    lead: string;
    sets: Array<{ day: string; title: string; time: string }>;
    /**
     * The player corner: genre chips, transport, the Spotify embed and the
     * track list. Every string is about what is really playing — a track the
     * site has bundled says so, a Spotify-only track says that instead.
     */
    corner: {
      eyebrow: string;
      nowPlaying: string;
      lastPlayed: string;
      side: string;
      onRotation: string;
      /** Marks a track in the list that only exists on Spotify. */
      onSpotify: string;
      /** The venue's Spotify playlist, shown under the rotation. */
      playlistTitle: string;
      playlistLead: string;
      openPlaylist: string;
      bundled: string;
      spotifyOnly: string;
      liveFrom: string;
      note: string;
      /** Named apart from `ui.playMusic` so the two controls stay distinguishable. */
      play: string;
      pause: string;
      previous: string;
      next: string;
      seek: string;
    };
  };
  blog: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    /** Opens the full-article dialog on a card. */
    readMore: string;
    closeArticle: string;
    posts: Array<{
      title: string;
      excerpt: string;
      tag: string;
      readTime: string;
      body: string[];
    }>;
  };
  reviews: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    summary: string;
    items: Array<{ name: string; rating: string; text: string; scores: string }>;
  };
  visit: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    lead: string;
    address: [string, string];
    phone: string;
    phoneHref: string;
    hours: string;
    dogs: string;
    mapsLabel: string;
    mapsHref: string;
  };
  footer: {
    nightlife: string;
    legal: string;
    visit: string;
    instagram: string;
    facebook: string;
    whatsapp: string;
    /** Heading over the section links. */
    explore: string;
    /** Heading over the off-site profiles. */
    follow: string;
  };
  ui: {
    language: string;
    playMusic: string;
    pauseMusic: string;
    nowPlaying: string;
    tapToPlay: string;
    /** Shown instead of a dead play button when no audio is bundled yet. */
    listenOnSpotify: string;
    openMenu: string;
    closeMenu: string;
    backToTop: string;
    whatsapp: string;
    /** Icon-only dismiss, used by the photo lightbox. */
    close: string;
    /** Lightbox transport — apart from `music.corner`'s track controls. */
    previous: string;
    next: string;
    /**
     * Accessible name for the icon-only phone links.
     *
     * Both the visit panel and the footer show the number as an icon rather
     * than printing the digits, so this is the only thing that tells a screen
     * reader what the link does — and the number is appended to it at the call
     * site, which is why it says "Call" and not "Call us on +90 …".
     */
    call: string;
  };
};
