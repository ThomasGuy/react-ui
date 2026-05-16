import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'postImage',
  title: 'Post Image',
  type: 'document',
  fields: [
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Instagram Photo',
      type: 'image',
      options: {
        hotspot: true, // Enables the interactive UI cropping/focus framework
      },
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value || !value.asset) return true;

          // Parse Sanity asset reference: "image-assetId-1080x1440-jpg"
          const ref = value.asset._ref || '';
          const parts = ref.split('-');
          if (parts.length < 4) return 'Invalid asset layout string';

          const dimensions = parts[2]; // Extracts "1080x1440"
          const [width, height] = dimensions.split('x').map(Number);

          if (!width || !height) return 'Could not parse image dimensions';

          const aspectRatio = width / height;
          const targetRatio = 0.75; // Standard 3:4 configuration (1080 / 1440)
          const tolerance = 0.02;   // Safety padding threshold for browser rounding issues

          if (Math.abs(aspectRatio - targetRatio) > tolerance) {
            return `Photo must use a strict 3:4 Portrait aspect ratio. Current upload dimensions: ${width}x${height}.`;
          }

          return true;
        }),
    }),
  ],
});
