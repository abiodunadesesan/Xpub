import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/provider";
import { BUSINESS, SITE_URL } from "@/lib/site";
import { structuredData } from "@/lib/structured-data";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm",
  display: "swap",
});

const TITLE = "X Pub Girne — Nightlife, VIP Rooms & DJs until 4 AM";

export const metadata: Metadata = {
  // Resolves every relative URL below (and the canonical) to one origin, so a
  // change of domain is a one-line edit in `lib/site.ts`.
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · X Pub Girne",
  },
  description: BUSINESS.description,
  applicationName: BUSINESS.alternateName,
  // Girne is the Turkish name and Kyrenia the English one for the same town;
  // searches arrive in both, so both are here.
  keywords: [
    "X Pub Girne",
    "X Pub Kyrenia",
    "Girne nightlife",
    "Kyrenia nightlife",
    "Kyrenia bar",
    "Girne bar",
    "Northern Cyprus nightclub",
    "live DJ Girne",
    "live music Kyrenia",
    "VIP rooms Girne",
    "cocktail bar Girne",
    "cocktails Kyrenia",
    "Girne promotions",
    "open until 4 AM Girne",
  ],
  authors: [{ name: BUSINESS.name, url: SITE_URL }],
  creator: BUSINESS.name,
  publisher: BUSINESS.name,
  category: "nightlife",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: BUSINESS.alternateName,
    title: TITLE,
    description: BUSINESS.description,
    locale: "en_GB",
    images: [
      {
        url: "/brand/og.jpg",
        width: 1200,
        height: 630,
        alt: "The X Pub monogram: a gold X inside a gold ring, above the word PUB.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: BUSINESS.description,
    images: ["/brand/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Phone numbers and addresses in the page should stay tappable rather than
  // being turned into Safari's own links.
  formatDetection: { telephone: false, address: false, email: false },
  referrer: "origin-when-cross-origin",
};

export const viewport: Viewport = {
  // Matches `--background`, so the browser chrome of a phone blends into the
  // page instead of showing a white band above a black site.
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`h-full antialiased ${cinzel.variable} ${cormorant.variable} ${dmSans.variable}`}
    >
      <body className="min-h-full flex flex-col font-body">
        <script
          type="application/ld+json"
          // Server-rendered from a literal above, so there is no user input to
          // escape — `<` is the only sequence that could break out of the tag.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
          }}
        />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
