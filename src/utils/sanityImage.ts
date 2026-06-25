import { createImageUrlBuilder } from '@sanity/image-url';
import { ISanityImage } from './types';

// Mock or import your existing configuration metadata
const sanityConfig = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'development',
};

// Create the single global engine instance
const builder = createImageUrlBuilder(sanityConfig);

/**
 * Generates an optimized, strict 3:4 portrait delivery link
 * utilizing Sanity's native crop engine specifications.
 *
 * @param source - The image object reference from your post payload (e.g., post.image_ref)
 */
export const getInstacloneTallUrl = (imageSource: ISanityImage): string => {
  return builder
    .image(imageSource)
    .width(900)
    .height(1200)
    .fit('crop')
    .crop('focalpoint')
    .auto('format')
    .url();
};

export const getInstacloneGridThumbnailUrl = (imageSource: ISanityImage): string => {
  return builder
    .image(imageSource)
    .width(300) // Downscaled footprint: 333px width is perfect resolution for a 4-column matrix split
    .height(400) // Hard mathematical 3:4 target calculation aspect boundary (400 / 0.75)
    .fit('crop')
    .crop('focalpoint')
    .auto('format')
    .url();
};
/**
 * Generates an optimized, square profile avatar link.
 *
 * @param assetRef - The raw asset ID string (e.g. user.avatarUrl)
 */
export const getInstacloneAvatarUrl = (assetRef: string | null | undefined): string | undefined => {
  if (!assetRef) return undefined;

  // If it's already an absolute fallback URL, bypass the builder
  if (assetRef.startsWith('http')) return assetRef;

  return builder
    .image(assetRef) // ✅ The builder accepts raw asset ID strings directly!
    .width(160) // 160px width is perfect resolution for a retina-display 80px avatar
    .height(160) // Force a 1:1 perfect square aspect ratio
    .fit('crop') // Crop around the focus point
    .crop('entropy')
    .auto('format') // Serve modern formats like WebP dynamically
    .url();
};
