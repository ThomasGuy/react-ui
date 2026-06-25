import React, { useState, useEffect } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

import { INewPost, IPost, IPostResponse } from '@/utils/types';
import { useAuth } from '@/context/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';

export const NewPost = ({ setPosts, onSuccess }: INewPost) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>(''); // 🚀 Fixed primitive typing baseline
  const [hotspot, setHotspot] = useState({ x: 0.5, y: 0.5, height: 1, width: 1 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { authFetch } = useAuth();
  const { uploadImage, uploading, uploadError } = useImageUpload();

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  useEffect(() => {
    if (uploadError) setError(uploadError);
  }, [uploadError]);

  const handleFileData = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    const imgData = evt.target.files ? evt.target.files[0] : null;
    if (imgData) {
      setError('');
      setImageFile(imgData);
      setHotspot({ x: 0.5, y: 0.5, height: 1, width: 1 });
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setHotspot({ x, y, height: 1, width: 1 });
  };

  const handleCreatePost = async (evt?: React.SyntheticEvent) => {
    evt?.preventDefault();
    if (!imageFile) {
      setError('Upload aborted: No image file selected.');
      return;
    }

    setLoading(true);
    try {
      const sanityAssetId = await uploadImage(imageFile);
      const createPostResponse = await authFetch('/post/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Ensure strict JSON parsing
        body: JSON.stringify({
          caption: caption.trim() || null,
          sanityImage: {
            asset: { _ref: sanityAssetId, _type: 'reference' },
            hotspot,
            crop: null,
          },
        }),
      });

      if (createPostResponse.ok) {
        const newPostData = (await createPostResponse.json()) as IPostResponse;
        const formattedPost: IPost = {
          ...newPostData,
          caption: newPostData.caption ?? '',
          timestamp: new Date(newPostData.createdAt),
          user: { username: newPostData.username },
          comments: [],
          likesCount: 0,
          hasLiked: false,
          viewCount: newPostData.viewCount || 0,
        };

        setPosts((prev) => [formattedPost, ...prev]);
        setImageFile(null);
        setCaption('');
        setHotspot({ x: 0.5, y: 0.5, height: 1, width: 1 });
        window.scrollTo(0, 0);
        onSuccess();
      } else {
        setError('Server rejected post structure creation.');
      }
    } catch (err) {
      console.error('Upload failed', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDownListener = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      if (imageFile && !loading && !uploading) {
        handleCreatePost(evt);
      }
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Stack
        direction="row"
        sx={{ mb: 4, alignItems: 'center', justifyContent: 'center' }}
        spacing={1.5}
      >
        <Box
          component="img"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
          alt="instagram"
          sx={{ height: 32, width: 'auto' }}
        />
        <Typography
          variant="h5"
          sx={{ fontWeight: '800', trackingSpacing: '-0.5px', color: 'text.primary' }}
        >
          New Post
        </Typography>
      </Stack>

      <Stack spacing={3}>
        <TextField
          name="caption"
          label="Write a caption..."
          variant="outlined"
          multiline
          rows={2}
          fullWidth
          onChange={(evt) => setCaption(evt.target.value)}
          value={caption}
          onKeyDown={onKeyDownListener}
        />

        {/* 🚀 Modern MUI v9 Accessible File Upload Integration Button */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Button
            component="label"
            variant="outlined"
            color="inherit"
            startIcon={<CloudUpload />}
            disabled={uploading || loading}
            sx={{ width: '100%', py: 1.5, borderStyle: 'dashed', borderWidth: '1.5px' }}
          >
            {imageFile ? 'Change Selected Image' : 'Select Image File'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileData}
              style={{
                clip: 'rect(0 0 0 0)',
                clipPath: 'inset(50%)',
                height: 1,
                overflow: 'hidden',
                position: 'absolute',
                bottom: 0,
                left: 0,
                whiteSpace: 'nowrap',
                width: 1,
              }}
            />
          </Button>
          {imageFile && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '100%' }}>
              Selected: {imageFile.name}
            </Typography>
          )}
        </Box>

        {/* INTERACTIVE HOTSPOT PREVIEW CONTAINER */}
        {previewUrl && (
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 1.5, fontWeight: '500' }}
            >
              🎯 Click image to target center crop hotspot focal point:
            </Typography>
            <Box
              sx={{
                position: 'relative',
                display: 'inline-block',
                cursor: 'crosshair',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: 'var(--mui-shadows-3)',
                border: '1px solid var(--mui-palette-divider)',
                maxWidth: '100%',
                maxHeight: '300px',
                bgcolor: 'black',
              }}
            >
              <Box
                component="img"
                src={previewUrl}
                onClick={handleImageClick}
                alt="Upload focal preview"
                sx={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '300px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: `${hotspot.x * 100}%`,
                  top: `${hotspot.y * 100}%`,
                  width: 24,
                  height: 24,
                  border: '2.5px solid #fff',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 8px rgba(0,0,0,0.8)',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  pointerEvents: 'none',
                  transition:
                    'left 0.15s cubic-bezier(0.1, 0.8, 0.2, 1), top 0.15s cubic-bezier(0.1, 0.8, 0.2, 1)',
                }}
              />
            </Box>
          </Box>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!imageFile || loading || uploading}
            onClick={handleCreatePost}
            sx={{
              width: '50%',
              py: 1.2,
              fontWeight: 'bold',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            {uploading ? 'Uploading Image...' : loading ? 'Creating Post...' : 'Share Post'}
          </Button>
          <Button
            variant="text"
            color="inherit"
            onClick={onSuccess}
            disabled={uploading || loading}
            sx={{ width: '50%', py: 1.2 }}
          >
            Cancel
          </Button>
        </Box>

        {error && (
          <Typography variant="body2" color="error" sx={{ textAlign: 'center', fontWeight: '500' }}>
            {error}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};
