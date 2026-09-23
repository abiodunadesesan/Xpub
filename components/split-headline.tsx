import { RevealWords } from "@/components/animated-text";

type SplitHeadlineProps = {
  first: string;
  second: string;
  className?: string;
};

/**
 * Che Bar–style split headline: Cinzel + gold accent.
 *
 * Each line rises word by word (`RevealWords`) with the second line trailing
 * the first, which is what makes the two-tone split read as one sentence
 * arriving rather than two labels appearing.
 */
export function SplitHeadline({ first, second, className }: SplitHeadlineProps) {
  return (
    <h2 className={`font-display leading-[0.95] ${className ?? ""}`}>
      {first ? (
        <RevealWords
          text={first}
          className="block text-[clamp(2.2rem,6.5vw,4.2rem)] tracking-[0.1em] text-white"
        />
      ) : null}
      {second ? (
        <RevealWords
          text={second}
          delay={0.09}
          className="mt-2 block text-[clamp(2.2rem,6.5vw,4.2rem)] tracking-[0.1em] text-[var(--gold)]"
        />
      ) : null}
    </h2>
  );
}
