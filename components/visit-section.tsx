"use client";

import { socialIconMap } from "@/components/social-icons";
import { XPubMap } from "@/components/xpub-map";
import { socials } from "@/lib/socials";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/lib/i18n/provider";

export function VisitSection() {
  const { t } = useI18n();

  return (
    <section id="visit" className="relative z-10 overflow-hidden py-20 sm:py-28">
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-28 bg-[var(--gold)]/85 skew-footer"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t.visit.eyebrow}
            titleTop={t.visit.titleTop}
            titleBottom={t.visit.titleBottom}
          />
          <p className="mt-5 font-serif text-lg leading-8 text-white/90">{t.visit.lead}</p>

          <div className="glass-card mt-6 p-5">
            <p className="font-display text-xl leading-snug tracking-[0.06em] text-white sm:text-2xl">
              {t.visit.address[0]}
              <br />
              {t.visit.address[1]}
            </p>
            <p className="mt-4 font-body text-[15px] text-white/85">{t.visit.hours}</p>
            <p className="mt-2 font-label text-[10px] text-[var(--gold)]">{t.visit.dogs}</p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={t.visit.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor
              className="glass-btn inline-flex min-h-12 items-center px-6 text-sm"
            >
              {t.visit.mapsLabel}
            </a>
            <a
              href={t.visit.phoneHref}
              data-cursor
              className="glass-btn-outline inline-flex min-h-12 items-center px-6 text-sm"
            >
              Call {t.visit.phone}
            </a>
            <ul className="flex items-center gap-2">
              {socials
                .filter((social) => social.icon !== "phone")
                .map((social) => {
                  const Icon = socialIconMap[social.icon];
                  return (
                    <li key={social.href}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        data-cursor
                        className="glass-panel inline-flex h-12 w-12 items-center justify-center text-white transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    </li>
                  );
                })}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass-card map-tilt overflow-hidden p-2">
            <XPubMap className="h-auto w-full" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
