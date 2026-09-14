export const brand = {
  name: "X Pub",
  short: "XPUB",
  city: "Girne",
  tagline: "From first pour to last call",
};

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#menu", label: "Menu" },
  { href: "#gallery", label: "Gallery" },
  { href: "#music", label: "Music" },
  { href: "#blog", label: "Blog" },
  { href: "#visit", label: "Visit" },
] as const;

export const hero = {
  eyebrow: "Şht. Fehmi Ercan · Girne",
  title: "X PUB",
  subtitle: "Girne",
  line: "Prestigious nights, VIP rooms, and DJs every evening",
  cta: "Explore",
  image: "/images/cover.jpg",
};

export const about = {
  eyebrow: "Our Story",
  titleTop: "About",
  titleBottom: "X Pub",
  paragraphs: [
    "Located in the heart of Girne’s nightlife strip, X Pub is a prestigious and stylish social spot built for nights that linger. Think exclusive atmosphere, VIP rooms, cold drinks, and a crowd that knows how to celebrate.",
    "From the first pour to the last track, every evening is tuned for energy — live DJs seven days a week, special guest sets, and themed nights that keep the floor moving until 4 AM.",
    "Whether you’re here for cocktail promotions, cold beer deals, or a late-night session with friends, X Pub is your go-to HQ in Northern Cyprus.",
  ],
  rating: "4.4 on Google · 9+ reviews",
};

export const experiences = {
  eyebrow: "Four moods, one house",
  titleTop: "Night",
  titleBottom: "to dawn",
  items: [
    {
      id: "vip",
      icon: "◆",
      time: "All night",
      title: "VIP Rooms",
      body: "Private tables and exclusive corners for birthdays, self service, and nights that stay off the main floor.",
      bullets: ["Exclusive atmosphere", "VIP seating", "Self service", "Private celebrations"],
    },
    {
      id: "dj",
      icon: "♪",
      time: "7 days a week",
      title: "Live DJs",
      body: "Resident and guest DJs keep Girne moving every night — including standout sets from names like DJ Mete.",
      bullets: ["Daily DJ sets", "Guest performers", "Themed nights", "Peak-hour energy"],
    },
    {
      id: "offers",
      icon: "★",
      time: "Weekly specials",
      title: "Promotions",
      body: "Weekly events with cocktail and cold beer promotions on key nights — including Monday and Friday deals.",
      bullets: ["Monday specials", "Friday promotions", "Cocktail deals", "Cold beer offers"],
    },
    {
      id: "social",
      icon: "◎",
      time: "Open until 4 AM",
      title: "Social Spot",
      body: "A spacious, stylish room made for groups — dogs welcome, tables that breathe, and staff who keep the night easy.",
      bullets: ["Dogs allowed", "Spacious layout", "Warm service", "Late closing"],
    },
  ],
};

export const menu = {
  eyebrow: "What we pour",
  titleTop: "The",
  titleBottom: "Menu",
  tabs: ["Cocktails", "Beer & Cold", "Nights"] as const,
  categories: {
    Cocktails: [
      { name: "House Signature", detail: "Bartender’s mix · citrus · night energy", price: "Ask bar" },
      { name: "Classic Martini", detail: "Clean, cold, and precise", price: "Ask bar" },
      { name: "Dark & Stormy Night", detail: "Spice, fizz, late-hour favorite", price: "Ask bar" },
      { name: "Girne Spritz", detail: "Light, bright, terrace-ready", price: "Ask bar" },
    ],
    "Beer & Cold": [
      { name: "Cold Draft", detail: "Ice-cold pours all night", price: "Promo nights" },
      { name: "Local Favorites", detail: "Rotating selection", price: "Ask bar" },
      { name: "Premium Bottles", detail: "For VIP tables & celebrations", price: "Ask bar" },
      { name: "Soft & Mixers", detail: "For the long session", price: "Ask bar" },
    ],
    Nights: [
      { name: "Monday Specials", detail: "Cocktail & cold beer promotions", price: "Weekly" },
      { name: "Friday Promotions", detail: "Weekend kickoff deals", price: "Weekly" },
      { name: "Guest DJ Nights", detail: "Special sets & themed evenings", price: "See schedule" },
      { name: "VIP Packages", detail: "Rooms, bottles, and priority seating", price: "Ask host" },
    ],
  },
  note: "Ask our team for tonight’s specials and DJ lineup.",
};

export const gallery = {
  eyebrow: "From the floor",
  titleTop: "The",
  titleBottom: "Gallery",
  images: [
    { src: "/images/cover.jpg", alt: "X Pub night atmosphere" },
    { src: "/images/puzzle-salon-multijoueur.jpg", alt: "Lounge seating" },
    { src: "/images/puzzle-espace-binouze.jpg", alt: "Bar counter energy" },
    { src: "/images/puzzle-instagram1.jpg", alt: "Crowd and lights" },
    { src: "/images/puzzle-instagram3.jpg", alt: "Drinks service" },
    { src: "/images/puzzle-instagram4.jpg", alt: "Night details" },
    { src: "/images/puzzle-team.jpg", alt: "Host behind the bar" },
    { src: "/images/puzzle-instagram5.jpg", alt: "Late night vibe" },
  ],
};

export const music = {
  eyebrow: "Select nights, all energy",
  titleTop: "Live",
  titleBottom: "Music",
  lead: "DJs seven days a week — plus special guest performances and themed nights. Follow our socials for the latest lineup.",
  sets: [
    { day: "Mon", title: "Promotion Night", time: "DJ + cocktail deals" },
    { day: "Tue", title: "Resident Set", time: "Floor open late" },
    { day: "Wed", title: "Midweek Heat", time: "Guest-friendly night" },
    { day: "Thu", title: "Build-Up", time: "Weekend warmup" },
    { day: "Fri", title: "Promotion Night", time: "DJ + cold beer deals" },
    { day: "Sat", title: "Peak Night", time: "Full energy until 4 AM" },
    { day: "Sun", title: "Late Session", time: "Close the week loud" },
  ],
};

export const blog = {
  eyebrow: "Updates",
  titleTop: "From",
  titleBottom: "the floor",
  posts: [
    {
      title: "Why Girne keeps choosing X Pub",
      excerpt: "Spacious rooms, warm staff, and a soundtrack that doesn’t quit — a quick look at what guests love most.",
      tag: "Atmosphere",
    },
    {
      title: "Monday & Friday: the promotion nights",
      excerpt: "Cocktail and cold beer specials that turn early week and Friday kickoff into easy plans.",
      tag: "Offers",
    },
    {
      title: "Meet the night: DJ-led evenings",
      excerpt: "From resident energy to guest performers, music is the backbone of every X Pub night.",
      tag: "Music",
    },
  ],
};

export const reviews = {
  eyebrow: "What guests say",
  titleTop: "Reviews",
  titleBottom: "4.4/5",
  summary: "9+ Google reviews · Food · Service · Atmosphere",
  items: [
    {
      name: "Damla Akyürek",
      rating: "5/5",
      text: "It was fantastic — I loved everything about it, from the atmosphere to the staff. It’s definitely on my list of places to visit again.",
      scores: "Food 5 · Service 5 · Atmosphere 5",
    },
    {
      name: "Cagan Arda",
      rating: "5/5",
      text: "I came to Cyprus for a short stay and this was the place I returned to every day. The staff are incredibly warm — huge thanks to DJ Mete for an amazing set.",
      scores: "Service · Music",
    },
    {
      name: "Lara",
      rating: "5/5",
      text: "Truly wonderful in every way. Tables aren’t cramped, the space feels open, and the drinks are both better and more affordable than most bars.",
      scores: "Atmosphere · Drinks",
    },
    {
      name: "Hasan Altuğ",
      rating: "5/5",
      text: "I’ll just say X — and stop there :)",
      scores: "Food 5 · Service 5 · Atmosphere 5",
    },
  ],
};

export const visit = {
  eyebrow: "Find us",
  titleTop: "Visit",
  titleBottom: "X Pub",
  lead: "Ready for Girne nightlife done properly? Come find us.",
  address: ["Şht. Fehmi Ercan Sk No:13", "Girne 9920, Northern Cyprus"],
  phone: "+90 533 854 70 40",
  phoneHref: "tel:+905338547040",
  hours: "Open daily · Closes 4 AM",
  dogs: "Dogs allowed",
  mapsLabel: "Google Maps",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=%C5%9Eht.+Fehmi+Ercan+Sk+No:13,+Girne+9920",
};

export const socials = [
  {
    href: "https://www.facebook.com/xpubgirne",
    label: "Facebook",
    icon: "facebook" as const,
  },
  {
    href: "https://www.instagram.com/xpubgirne/",
    label: "Instagram",
    icon: "instagram" as const,
  },
  {
    href: "tel:+905338547040",
    label: "Phone",
    icon: "phone" as const,
  },
];
