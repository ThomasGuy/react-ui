import React, { useState, useEffect } from 'react';
import { Box, Button, Input, Stack, TextField, Typography } from '@mui/material';

import { INewPost, IPost, IPostResponse } from '@/utils/types';
import { style } from './modal_style';
import { useAuth } from '@/context/AuthContext';

export const NewPost = ({ setPosts, onSuccess }: INewPost) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hotspot, setHotspot] = useState({ x: 0.5, y: 0.5, height: 1, width: 1 });

  const { authFetch } = useAuth();
  const MAX_FILE_SIZE = 7 * 1024 * 1024; // Exactly 7MB in bytes

  // 🌟 Auto-generate or cleanup object blob URLs to prevent client memory leaks
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleFileData = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    const imgData = evt.target.files ? evt.target.files[0] : null;
    if (imgData && imgData.size > MAX_FILE_SIZE) {
      setError('Choose a file less than 7MB.');
      evt.target.value = '';
      return;
    }
    setImageFile(imgData);
    setHotspot({ x: 0.5, y: 0.5, height: 1, width: 1 });
  };

  // 🌟 Handles the coordinate target intersection arithmetic on image tap/click
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    // Convert click location into precision floating percentages (0.0 to 1.0)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setHotspot({ x, y, height: 1, width: 1 });
  };

  const handleCreatePost = async (evt?: React.SyntheticEvent) => {
    evt?.preventDefault();
    setLoading(true);

    try {
      if (imageFile) {
        const formdata = new FormData();
        formdata.append('file', imageFile);

        const uploadResponse = await authFetch('/post/image', {
          method: 'POST',
          body: formdata,
        });

        if (uploadResponse.status === 413) {
          throw new Error('The server rejected the file because it exceeds the 7MB limit.');
        }
        if (!uploadResponse.ok) throw new Error('Image asset clearance failed.');

        // Destructure the incoming ID string
        const { sanityAssetId } = await uploadResponse.json();

        // --- PART 3: Send Post Payload to Rust Backend ---
        const createPostResponse = await authFetch('/post/create', {
          method: 'POST',
          body: JSON.stringify({
            caption,
            sanityImage: {
              asset: {
                _ref: sanityAssetId,
                _type: 'reference',
              },
              hotspot: {
                x: hotspot.x,
                y: hotspot.y,
                height: hotspot.height,
                width: hotspot.width,
              },
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
        }
      } else {
        setError('Upload aborted: No image file selected.');
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
      evt.preventDefault(); // Just in case, stops any bubbling
      if (imageFile && !loading) {
        handleCreatePost(evt);
      }
    }
  };

  return (
    <Box sx={style}>
      <Stack direction="row" sx={{ mb: 3, alignItems: 'center' }} spacing={2}>
        <Box
          component="img"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
          alt="instagram"
          sx={{ height: 30, width: 'auto', display: { xs: 'none', sm: 'block' } }}
        />
        <Typography id="modal-mewPost-title" variant="h5" sx={{ flexGrow: 1, textAlign: 'center' }}>
          New post
        </Typography>
        <Box sx={{ width: { xs: 0, sm: '30px' } }} />
      </Stack>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          name="caption"
          placeholder="Enter a caption"
          onChange={(evt) => setCaption(evt.target.value)}
          value={caption}
        />

        <Box>
          <Typography variant="caption" sx={{ display: 'block' }} gutterBottom>
            Select Image:
          </Typography>
          <Input
            type="file"
            id="fileInput"
            onChange={handleFileData}
            onKeyDown={onKeyDownListener}
          />
        </Box>

        {/* 🌟 INTERACTIVE HOTSPOT PREVIEW CONTAINER */}
        {previewUrl && (
          <Box sx={{ textAlign: 'center', my: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Click on the image to set the crop focus point:
            </Typography>
            <Box
              sx={{
                position: 'relative',
                display: 'inline-block',
                cursor: 'crosshair',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 2,
                maxWidth: '100%',
                maxHeight: '300px',
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
                }}
              />
              {/* Floating Reticle Targeting ring marker representing the active hotspot */}
              <Box
                sx={{
                  position: 'absolute',
                  left: `${hotspot.x * 100}%`,
                  top: `${hotspot.y * 100}%`,
                  width: 20,
                  height: 20,
                  border: '2px solid #fff',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 6px rgba(0,0,0,0.8)',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  pointerEvents: 'none', // Lets clicks fall straight through onto the image element below
                  transition: 'left 0.15s ease-out, top 0.15s ease-out', // Smooth reticle glides
                }}
              />
            </Box>
          </Box>
        )}

        <Button
          variant="text"
          color="primary"
          type="submit"
          disabled={!imageFile || loading}
          onClick={handleCreatePost}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </Button>

        {error && <Typography color="error">{error}</Typography>}
      </Stack>
    </Box>
  );
};
