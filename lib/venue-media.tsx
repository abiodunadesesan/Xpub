"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LOCAL_MEDIA } from "@/lib/local-media";
import { buildVenueMedia, type VenueMedia } from "@/lib/media-allocate";
import type { MediaManifest } from "@/lib/media-types";

export type {
  ExperienceMediaPack,
  VenueMedia,
} from "@/lib/media-allocate";
export type { VenueMediaItem } from "@/lib/media-types";

/**
 * Client-side ceiling for the manifest request. The route already caps R2 at
 * 5s, so anything past this is the request itself stalling — fall back rather
 * than leave every section on a skeleton.
 */
const MANIFEST_TIMEOUT_MS = 8_000;

const VenueMediaContext = createContext<VenueMedia | null>(null);

/**
 * A 200 response isn't proof of a manifest: an error page or an upstream
 * error body posted with a 200 would otherwise reach the allocator as garbage.
 */
function isManifest(value: unknown): value is MediaManifest {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<MediaManifest>;
  return Array.isArray(candidate.images) && Array.isArray(candidate.videos);
}

export function VenueMediaProvider({ children }: { children: ReactNode }) {
  const [manifest, setManifest] = useState<MediaManifest | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), MANIFEST_TIMEOUT_MS);
    // Only teardown is allowed to skip the fallback — a timeout abort must not.
    let unmounted = false;

    const fallback = (error: unknown) => {
      if (unmounted) return;
      console.error(
        "[media] manifest unavailable, using bundled media:",
        error,
      );
      setManifest(LOCAL_MEDIA);
    };

    fetch("/api/media", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: unknown = await response.json();
        if (!isManifest(data)) throw new Error("Malformed media manifest");
        return data;
      })
      .then((data) => {
        if (!unmounted) setManifest(data);
      })
      .catch(fallback)
      .finally(() => clearTimeout(timeout));

    return () => {
      unmounted = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const value = useMemo(() => buildVenueMedia(manifest), [manifest]);

  return (
    <VenueMediaContext.Provider value={value}>
      {children}
    </VenueMediaContext.Provider>
  );
}

export function useVenueMedia() {
  const ctx = useContext(VenueMediaContext);
  if (!ctx) {
    throw new Error("useVenueMedia must be used within VenueMediaProvider");
  }
  return ctx;
}
