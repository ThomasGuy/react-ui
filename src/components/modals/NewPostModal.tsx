import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

import { Crop, Hotspot, IPost, IPostResponse, ISetPosts } from '@/utils/types';
import { useAuth } from '@/context/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ImagePreview } from '../preview/preview';
import { style } from './modal_style';

interface INewPostModalProps {
  open: boolean;
  onClose: () => void;
  setPosts: ISetPosts;
}

export const NewPostModal = ({ open, onClose, setPosts }: INewPostModalProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageFileRef = useRef<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [caption, setCaption] = useState<string>(''); // 🚀 Fixed primitive typing baseline
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const [crop, setCrop] = useState<Crop>({
    _type: 'sanity.imageCrop',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });
  const [hotspot, setHotspot] = useState<Hotspot>({
    _type: 'sanity.imageHotspot',
    x: 0.5,
    y: 0.5,
    height: 1,
    width: 1,
  });

  const { authFetch } = useAuth();
  const { uploadImage, uploading, uploadError } = useImageUpload();

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(undefined);
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
      imageFileRef.current = imgData; // 🚀 Sync live value to Ref
      setHotspot({ _type: 'sanity.imageHotspot', x: 0.5, y: 0.5, height: 1, width: 1 });
    }
  };

  const handleCreatePost = async (evt?: React.SyntheticEvent) => {
    evt?.preventDefault();

    // 1. If a submission is already in flight, instantly kill any duplicate triggers
    if (isSubmittingRef.current || loading || uploading) return;

    const activeFile = imageFileRef.current;
    if (!activeFile) {
      setError('Upload aborted: No image file selected.');
      return;
    }

    // 2. Lock the gate synchronously right now
    isSubmittingRef.current = true;
    setLoading(true);
    try {
      const sanityAssetId = await uploadImage(activeFile);
      const createPostResponse = await authFetch('/post/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Ensure strict JSON parsing
        body: JSON.stringify({
          caption: caption.trim() || null,
          sanityImage: {
            asset: { _ref: sanityAssetId, _type: 'reference' },
            hotspot,
            crop,
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
        window.scrollTo(0, 0);
        handleCancelAndClear();
      } else {
        setError('Server rejected post structure creation.');
      }
    } catch (err) {
      console.error('Upload failed', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const onKeyDownListener = (evt: React.KeyboardEvent<HTMLElement>) => {
    if (evt.key === 'Enter') {
      if ((evt.target as HTMLElement).nodeName === 'TEXTAREA' && evt.shiftKey) return;
      evt.preventDefault();
      handleCreatePost(evt);
    }
  };

  const handleCancelAndClear = () => {
    setImageFile(null);
    imageFileRef.current = null;
    setPreviewUrl(undefined);
    setCaption('');
    setError('');
    isSubmittingRef.current = false;
    setHotspot({ _type: 'sanity.imageHotspot', x: 0.5, y: 0.5, height: 1, width: 1 });
    setCrop({ _type: 'sanity.imageCrop', top: 0, bottom: 0, left: 0, right: 0 });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return; // ◄ Ignore backdrop clicks completely!
        handleCancelAndClear();
      }}
      sx={style}
      fullWidth
      maxWidth="xs"
    >
      <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
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
            sx={{ fontWeight: '800', letterSpacing: '-0.5px', color: 'text.primary' }}
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
            <ImagePreview previewUrl={previewUrl} setCrop={setCrop} setHotspot={setHotspot} />
          )}

          {error && (
            <Typography
              variant="body2"
              color="error"
              sx={{ textAlign: 'center', fontWeight: '500' }}
            >
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      {/* FIXED ACTION REGION (MUI v9 Optimized) */}
      <DialogActions sx={{ px: { xs: 1, sm: 2 }, pb: 2, gap: 1 }}>
        <Button
          variant="text"
          color="inherit"
          onClick={handleCancelAndClear}
          disabled={uploading || loading}
          sx={{ width: '50%', py: 1.2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="button" // ◄ Automatically triggers the parent form's onSubmit
          disabled={!imageFile || loading || uploading}
          onClick={handleCreatePost}
          onKeyDown={onKeyDownListener}
          sx={{ width: '50%', py: 1.2, fontWeight: 'bold' }}
        >
          {uploading ? 'Uploading...' : loading ? 'Creating...' : 'Share Post'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
