"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/reveal";
import { Skeleton } from "@/components/skeleton";
import { useVenueMedia } from "@/lib/venue-media";
import { useI18n } from "@/lib/i18n/provider";

/**
 * Whether the hero clip yields to `prefers-reduced-motion`.
 *
 * Off by default, because the clip is the hero content rather than decoration —
 * and because every other autoplaying clip on the site (gallery, menu, music)
 * ignores the preference, so opting out only here was inconsistent. Flip this to
 * `true` to serve the still instead whenever a visitor has reduced motion on.
 */
const RESPECT_REDUCED_MOTION = false;

export function HeroSection() {
  const { t } = useI18n();
  const { heroImage, heroVideo, isLoading } = useVenueMedia();
  const imageSrc = heroImage?.url ?? "/images/cover.jpg";
  const reduce = useReducedMotion();
  const showVideo =
    Boolean(heroVideo?.url) && !(RESPECT_REDUCED_MOTION && reduce);
  const stageRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 40]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, reduce ? 1 : 0.35]);

  return (
    <section
      id="top"
      ref={stageRef}
      className="hero-stage relative z-10 min-h-[100svh] overflow-hidden"
    >
      <div aria-hidden className="hero-slash" />

      <motion.span
        aria-hidden
        className="arcade-star absolute left-[46%] top-[34%] z-20 hidden text-[var(--yellow)] lg:block"
        animate={reduce ? undefined : { opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        ✦
      </motion.span>
      <span
        aria-hidden
        className="absolute left-[48%] top-[42%] z-20 hidden h-2 w-2 rounded-full bg-[var(--yellow)] lg:block"
      />
      <span
        aria-hidden
        className="absolute left-[49.5%] top-[48%] z-20 hidden h-1.5 w-1.5 rounded-full bg-[var(--gold)] lg:block"
      />
      <span aria-hidden className="arcade-star absolute left-[45%] top-[55%] z-20 hidden text-white/75 lg:block">
        ✦
      </span>

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-7xl items-center gap-8 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-12 lg:gap-0 lg:px-8 lg:pb-20 lg:pt-24">
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative z-20 lg:col-span-6">
          <Reveal className="max-w-xl lg:max-w-none" y={28}>
            <div>
              <motion.p
                className="font-display text-[clamp(3rem,9vw,5.2rem)] font-semibold leading-[0.9] tracking-[0.12em] text-white"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                {t.hero.logo}
              </motion.p>
            </div>

            <h1 className="mt-10 font-display leading-[0.92]">
              <span className="block text-[clamp(1.85rem,5vw,3.2rem)] tracking-[0.08em] text-[var(--gold)]">
                {t.hero.headlineTop}
              </span>
              <span className="mt-1 block text-[clamp(1.85rem,5vw,3.2rem)] tracking-[0.08em] text-white">
                {t.hero.headlineBottom}
              </span>
            </h1>

            <div className="mt-7 max-w-md space-y-4 font-serif text-lg leading-8 text-white/85">
              {t.hero.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>

            <a
              href="#about"
              data-cursor
              className="glass-btn mt-8 inline-flex min-h-12 items-center px-7 text-sm transition hover:-translate-y-0.5"
            >
              {t.hero.cta}
            </a>
          </Reveal>
        </motion.div>

        <div className="relative z-10 lg:col-span-6 lg:h-[min(78vh,720px)]">
          <motion.div style={{ y: mediaY }} className="h-full">
            <Reveal delay={0.12} className="h-full" x={40} y={20}>
              <div className="hero-cover relative mx-auto h-[min(62vh,520px)] w-full max-w-lg lg:absolute lg:-right-6 lg:top-0 lg:mx-0 lg:h-full lg:max-w-none lg:w-[118%]">
                <div className="hero-cover-skew absolute inset-0">
                  <div className="hero-cover-media absolute -inset-[14%]">
                    {isLoading && !heroImage && !heroVideo ? (
                      <Skeleton className="h-full w-full" />
                    ) : showVideo ? (
                      <video
                        className="h-full w-full object-cover"
                        src={heroVideo!.url}
                        poster={heroImage?.url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        aria-label="X Pub Girne"
                      />
                    ) : (
                      <Image
                        src={imageSrc}
                        alt="X Pub Girne neon"
                        fill
                        priority
                        sizes="(max-width: 1024px) 90vw, 50vw"
                        className="object-cover object-[58%_40%]"
                      />
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
