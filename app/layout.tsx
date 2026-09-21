import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/provider";

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

export const metadata: Metadata = {
  title: "X Pub Girne — Nightlife, VIP & DJs until 4 AM",
  description:
    "X Pub is a prestigious nightlife spot in Girne with VIP rooms, live DJs every night, weekly promotions, and late closing at 4 AM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${cinzel.variable} ${cormorant.variable} ${dmSans.variable}`}
    >
      <body className="min-h-full flex flex-col font-body">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
