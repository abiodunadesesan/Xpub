type SplitHeadlineProps = {
  first: string;
  second: string;
  className?: string;
};

/** Che Bar–style split headline: Cinzel + gold accent. */
export function SplitHeadline({ first, second, className }: SplitHeadlineProps) {
  return (
    <h2 className={`font-display leading-[0.95] ${className ?? ""}`}>
      {first ? (
        <span className="block text-[clamp(2.2rem,6.5vw,4.2rem)] tracking-[0.1em] text-white">
          {first}
        </span>
      ) : null}
      {second ? (
        <span className="mt-2 block text-[clamp(2.2rem,6.5vw,4.2rem)] tracking-[0.1em] text-[var(--gold)]">
          {second}
        </span>
      ) : null}
    </h2>
  );
}
