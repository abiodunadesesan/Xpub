"use client";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden bg-white/[0.06] ${className}`}
    >
      <div className="skeleton-shimmer absolute inset-0" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div
      className="mx-auto grid min-h-[100svh] max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-12 lg:px-8"
      aria-busy
      aria-label="Loading"
    >
      <div className="space-y-5 lg:col-span-6">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-16 w-72 sm:h-20 sm:w-96" />
        <Skeleton className="h-8 w-40" />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-[85%] max-w-sm" />
        </div>
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3 w-full max-w-md" />
          <Skeleton className="h-3 w-[92%] max-w-md" />
          <Skeleton className="h-3 w-[78%] max-w-sm" />
        </div>
        <Skeleton className="mt-4 h-12 w-36" />
      </div>
      <div className="lg:col-span-6">
        <div className="hero-cover-skew relative mx-auto h-[min(62vh,520px)] w-full max-w-lg overflow-hidden lg:ml-auto lg:h-[min(78vh,720px)] lg:max-w-none">
          <Skeleton className="absolute inset-0 h-full w-full" />
        </div>
      </div>
    </div>
  );
}

export function GallerySkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" aria-busy>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className={`w-full ${
            index === 0 || index === 5
              ? "h-56 md:col-span-2 md:row-span-2 md:min-h-[28rem]"
              : "h-40 md:h-52"
          }`}
        />
      ))}
    </div>
  );
}

export function CardGridSkeleton({
  count = 3,
  className = "grid gap-4 md:grid-cols-3",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className} aria-busy>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3 border border-white/10 p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[88%]" />
        </div>
      ))}
    </div>
  );
}
