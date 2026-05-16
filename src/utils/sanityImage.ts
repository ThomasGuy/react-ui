import { createImageUrlBuilder } from "@sanity/image-url";

// Mock or import your existing configuration metadata
export const sanityConfig = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || "production",
};

// Create the single global engine instance
export const builder = createImageUrlBuilder(sanityConfig);

/**
 * Generates an optimized, strict 3:4 portrait delivery link
 * utilizing Sanity's native crop engine specifications.
 *
 * @param source - The image object reference from your post payload (e.g., post.image_ref)
 */
export const getInstagramTallUrl = (source: string) => {
  return (
    builder
      .image(source)
      .width(1080)
      .height(1440)
      .fit("crop")
      // Respects the custom focal point bubble set by your user inside the studio
      .crop("focalpoint")
      .auto("format")
      .url()
  );
};

export const getInstagramGridThumbnailUrl = (source: string) => {
  return builder
    .image(source)
    .width(400) // Downscaled footprint: 400px width is perfect resolution for a 3-column matrix split
    .height(533) // Hard mathematical 3:4 target calculation aspect boundary (400 / 0.75)
    .fit("crop")
    .crop("focalpoint")
    .auto("format")
    .url();
};
