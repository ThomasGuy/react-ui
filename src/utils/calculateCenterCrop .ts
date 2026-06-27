export const calculateCenter3x4Crop = (naturalWidth: number, naturalHeight: number) => {
  const currentRatio = naturalWidth / naturalHeight;
  const targetRatio = 3 / 4; // 0.75 Portrait baseline

  let top = 0;
  let bottom = 0;
  let left = 0;
  let right = 0;

  if (currentRatio > targetRatio) {
    // Image is wider than 3:4 (Landscape/Square) -> Slice off the left and right sides
    const croppedWidth = naturalHeight * targetRatio;
    const totalHorizontalCrop = (naturalWidth - croppedWidth) / naturalWidth;
    left = totalHorizontalCrop / 2;
    right = totalHorizontalCrop / 2;
  } else if (currentRatio < targetRatio) {
    // Image is taller than 3:4 (Tall Portrait) -> Slice off the top and bottom sides
    const croppedHeight = naturalWidth / targetRatio;
    const totalVerticalCrop = (naturalHeight - croppedHeight) / naturalHeight;
    top = totalVerticalCrop / 2;
    bottom = totalVerticalCrop / 2;
  }

  return { top, bottom, left, right };
};
