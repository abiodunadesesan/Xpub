import type { Metadata } from "next";
import "./globals.css";
import { PubProvider } from "@/lib/pub-store";
import { AnalyticsProvider } from "@/components/analytics-provider";

export const metadata: Metadata = {
  title: "The Obsidian XPub | Craft Taps & Gastropub Kitchen",
  description: "Modern gastropub with real-time craft beer tap sync, transactional table booking engine, live venue audio feed, and AI Sommelier assistant.",
  keywords: ["Gastropub", "Craft Beer Taps", "Table Reservations", "Wagyu Burger", "AI Sommelier", "Convex Realtime"],
  openGraph: {
    title: "The Obsidian XPub | Craft Taps & Gastropub Kitchen",
    description: "Modern gastropub with real-time craft beer tap sync, transactional table booking engine, live venue audio feed, and AI Sommelier assistant.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased bg-pub-dark text-white min-h-screen">
        <AnalyticsProvider>
          <PubProvider>{children}</PubProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
