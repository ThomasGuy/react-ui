import React, { useState } from 'react';
import { Box, Button, Input, Stack, TextField, Typography } from '@mui/material';

import { INewPost, IPost, IPostResponse } from '../types';
import { style } from './modal_style';
import { useAuth } from '../../context/AuthContext';

export const NewPost = ({ setPosts, onSuccess }: INewPost) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [caption, setCaption] = useState<string | null>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { authFetch } = useAuth();

  const handleFileData = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    const imgData = evt.target.files ? evt.target.files[0] : null;
    if (imgData) {
      setImageFile(imgData);
    }
  };

  const handleCreatePost = async (evt?: React.SyntheticEvent) => {
    evt?.preventDefault();
    setLoading(true);

    try {
      if (imageFile) {
        const formdata = new FormData();
        formdata.append('image', imageFile);

        const uploadResponse = await authFetch('/post/iamge', {
          method: 'POST',
          body: formdata,
        });

        if (!uploadResponse.ok) throw new Error('Image asset clearance failed.');
        const { sanityAssetId } = await uploadResponse.json();

        // --- PART 3: Send Payload to Rust Backend ---
        const backendResponse = await authFetch('/post/create', {
          method: 'POST',
          body: JSON.stringify({
            caption,
            sanityAssetId,
          }),
        });

        if (backendResponse.ok) {
          const newPostData = (await backendResponse.json()) as IPostResponse;
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
