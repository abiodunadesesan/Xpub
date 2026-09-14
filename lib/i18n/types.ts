export type Dictionary = {
  brand: { name: string; short: string; city: string; tagline: string };
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
  gallery: { eyebrow: string; titleTop: string; titleBottom: string };
  music: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    lead: string;
    sets: Array<{ day: string; title: string; time: string }>;
  };
  blog: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    posts: Array<{ title: string; excerpt: string; tag: string }>;
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
  footer: { nightlife: string; legal: string; visit: string; instagram: string };
  ui: {
    language: string;
    playMusic: string;
    pauseMusic: string;
    nowPlaying: string;
    tapToPlay: string;
    openMenu: string;
    closeMenu: string;
  };
};
