import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Starfield } from "@/components/starfield";

export default function LegalPage() {
  return (
    <>
      <Starfield />
      <SiteHeader />
      <main className="relative z-10 mx-auto max-w-3xl flex-1 px-4 py-28 sm:px-6">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-white/60">
          Legal notice
        </p>
        <h1 className="mt-3 font-display text-4xl text-[var(--yellow)] sm:text-5xl">
          Information
        </h1>
        <div className="mt-8 space-y-4 font-body text-[15px] leading-7 text-white/85">
          <p>
            This website presents X Pub Girne for informational and promotional
            purposes.
          </p>
          <p>
            Address: Şht. Fehmi Ercan Sk No:13, Girne 9920. Phone: +90 533 854 70
            40. Follow updates on{" "}
            <a
              href="https://www.instagram.com/xpubgirne/"
              className="text-[var(--yellow)] underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>{" "}
            and{" "}
            <a
              href="https://www.facebook.com/xpubgirne"
              className="text-[var(--yellow)] underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
            .
          </p>
        </div>
        <Link
          href="/"
          className="mt-10 inline-flex font-body text-sm text-[var(--yellow)] hover:underline"
        >
          ← Back to home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
