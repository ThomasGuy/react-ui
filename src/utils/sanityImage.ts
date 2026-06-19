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
