import { useCallback, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Cropper, { Area } from 'react-easy-crop';
import { ISetCropFn, ISetHotspotFn } from '@/utils/types';

export interface IPreview {
  previewUrl: string | undefined;
  setCrop: ISetCropFn;
  setHotspot: ISetHotspotFn;
}

export const ImagePreview = ({ previewUrl, setCrop, setHotspot }: IPreview) => {
  const [cropGrid, setCropGrid] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // 🚀 FIXED: Wrapped in useCallback to prevent layout stutter bugs in React 19
  const handleCropComplete = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (croppedArea: Area, _croppedAreaPixels: Area) => {
      // Convert react-easy-crop's pixel percentages into Sanity's edge offset fractions (0 to 1)
      const top = croppedArea.y / 100;
      const left = croppedArea.x / 100;
      const bottom = (100 - (croppedArea.y + croppedArea.height)) / 100;
      const right = (100 - (croppedArea.x + croppedArea.width)) / 100;

      setCrop({ _type: 'sanity.imageCrop', top, bottom, left, right });

      // 🎯 Automatically align the hotspot center-of-attention directly to the middle of their chosen crop!
      setHotspot({
        _type: 'sanity.imageHotspot',
        x: (croppedArea.x + croppedArea.width / 2) / 100,
        y: (croppedArea.y + croppedArea.height / 2) / 100,
        width: croppedArea.width / 100,
        height: croppedArea.height / 100,
      });
    },
    [setCrop, setHotspot],
  ); // Safely track state dispatches in dependency line

  return (
    <Box sx={{ textAlign: 'center', mt: 1 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 1.5, fontWeight: '500' }}
      >
        ↔️ Drag image to frame your 3:4 portrait crop window:
      </Typography>

      {/* 🚀 STABLE VIEWPORT FRAME */}
      <Box
        sx={{
          position: 'relative',
          display: 'block',
          margin: '0 auto',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 'var(--mui-shadows-3)',
          border: '1px solid var(--mui-palette-divider)',
          width: '225px', // Perfect compact portrait fit inside Dialog layout
          aspectRatio: '3 / 4', // Locks the viewing box strictly to 3:4 portrait
          bgcolor: '#121212',
        }}
      >
        <Cropper
          image={previewUrl}
          crop={cropGrid}
          zoom={zoom}
          aspect={3 / 4} // 🚀 Forces the interactive crop window boundaries to 3:4 portrait
          onCropChange={setCropGrid}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          showGrid={true} // Renders a native rule-of-thirds photography line overlay automatically
          objectFit="contain"
          style={{
            containerStyle: { width: '100%', height: '100%', position: 'absolute' },
            cropAreaStyle: {
              border: '2px solid #fff',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            },
          }}
        />
      </Box>

      {/* OPTIONAL ACCESSIBLE ZOOM SLIDER CONTROLLER BELOW THE COMPONENT */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Use mouse wheel or pinch to zoom and scale photo framing.
      </Typography>
    </Box>
  );
};
