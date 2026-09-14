import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const files = await ctx.db.system.query("_storage").collect();

    const media = (
      await Promise.all(
        files.map(async (file) => {
          const url = await ctx.storage.getUrl(file._id);
          if (!url) return null;
          return {
            _id: file._id,
            url,
            contentType: file.contentType ?? "application/octet-stream",
            size: file.size,
            kind: file.contentType?.startsWith("video/")
              ? ("video" as const)
              : file.contentType?.startsWith("image/")
                ? ("image" as const)
                : ("other" as const),
          };
        }),
      )
    ).filter((item): item is NonNullable<typeof item> => item !== null);

    const images = media
      .filter((item) => item.kind === "image")
      .sort((a, b) => a.size - b.size);
    const videos = media.filter((item) => item.kind === "video");

    return {
      images,
      videos,
      all: media,
    };
  },
});
