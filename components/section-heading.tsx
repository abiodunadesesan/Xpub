import { TrackingIn } from "@/components/animated-text";
import { SplitHeadline } from "@/components/split-headline";

type SectionHeadingProps = {
  eyebrow: string;
  titleTop: string;
  titleBottom: string;
};

/** Shared eyebrow + split-headline block that opens every section. */
export function SectionHeading({
  eyebrow,
  titleTop,
  titleBottom,
}: SectionHeadingProps) {
  return (
    <>
      <p className="font-label text-[11px] text-[var(--gold)]">
        <TrackingIn text={eyebrow} />
      </p>
      <div className="mt-3">
        <SplitHeadline first={titleTop} second={titleBottom} />
      </div>
    </>
  );
}
