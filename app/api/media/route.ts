import { NextResponse } from "next/server";
import { resolveMediaManifest } from "@/lib/media-source";

/** Always re-list: media changes should show up without a redeploy. */
export const dynamic = "force-dynamic";

/**
 * Serves the media manifest for every section.
 *
 * Never fails and never returns an empty list. Resolution order and the
 * caching that protects an unreachable bucket both live in `lib/media-source`;
 * this route only maps the result to a response. `?fresh=1` bypasses the
 * cache, which is what the verification harness uses.
 */
export async function GET(request: Request) {
  const fresh = new URL(request.url).searchParams.has("fresh");
  const { manifest, source, stale, error } = await resolveMediaManifest({ fresh });

  if (stale) {
    console.error(`[media] serving ${source} copy — live listing failed:`, error);
  }

  return NextResponse.json(manifest, {
    headers: {
      // A stale copy is cached briefly, so recovery isn't held back by the edge.
      "Cache-Control": stale
        ? "public, max-age=0, s-maxage=10, stale-while-revalidate=60"
        : "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      "X-Media-Source": source,
    },
  });
}
