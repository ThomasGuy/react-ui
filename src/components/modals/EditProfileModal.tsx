import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

import { useImageUpload } from '@/hooks/useImageUpload';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';
import { getInstacloneAvatarUrl } from '@/utils/sanityImage';
import { IUpdateProfilePayload, IUser } from '@/utils/types';
import { style } from './modal_style';

interface IEditProfileProps {
  user: IUser;
  open: boolean;
  onClose: () => void;
}

export const EditProfileModal = ({ user, open, onClose }: IEditProfileProps) => {
  const { uploadImage, uploading } = useImageUpload();
  const { updateProfile, loading } = useProfileUpdate();

  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [warning, setWarning] = useState('');

  // Synchronize internal form state when modal re-opens or user context mutates
  useEffect(() => {
    if (open) {
      setAvatarUrl(user.avatarUrl || '');
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setWarning('');
    }
  }, [open, user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setWarning('');
    try {
      // 🌟 Uploads the image instantly to Sanity via Rust server
      const sanityAssetId = await uploadImage(file);
      setAvatarUrl(sanityAssetId);
    } catch (err) {
      console.error('Avatar prep failed', err);
      setWarning('Failed to upload image to Sanity.');
    }
  };

  const handleSave = async (evt?: React.SyntheticEvent) => {
    evt?.preventDefault();
    if (uploading) {
      setWarning('Please wait, image is still uploading.');
      return;
    }

    const payload: IUpdateProfilePayload = {
      displayName: displayName.trim() || null,
      bio: bio.trim() || null,
      avatarUrl: avatarUrl || null,
    };

    try {
      await updateProfile(payload);
      onClose();
    } catch (err) {
      console.error('Profile save failed:', err);
      setWarning('Could not save profile changes.');
    }
  };

  return (
    <Dialog
      sx={style}
      open={open}
      onClose={uploading || loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Edit Profile</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {/* Avatar Preview & File Target Context Zone */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={getInstacloneAvatarUrl(avatarUrl || undefined)}
              sx={{ width: 80, height: 80, border: '1px solid var(--mui-palette-divider)' }}
            >
              {!avatarUrl && user.username.charAt(0).toUpperCase()}
            </Avatar>

            <Button
              component="label"
              role={undefined}
              variant="outlined"
              size="small"
              tabIndex={-1}
              startIcon={<CloudUpload />}
              disabled={uploading || loading}
            >
              {uploading ? 'Uploading...' : 'Change Profile Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
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
          </Box>
          {/* Form Fields */}
          <TextField
            label="Display Name"
            name="displayname"
            type="text"
            fullWidth
            value={displayName}
            onChange={(evt) => setDisplayName(evt.target.value)}
            disabled={uploading || loading}
          />

          <TextField
            label="Bio"
            name="bio"
            type="text"
            multiline
            rows={3}
            fullWidth
            value={bio}
            onChange={(evt) => setBio(evt.target.value)}
            disabled={uploading || loading}
          />

          {warning && (
            <Typography
              variant="caption"
              color="error"
              sx={{ textAlign: 'center', fontWeight: 'medium' }}
            >
              {warning}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="text" color="inherit" onClick={onClose} disabled={uploading || loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={uploading || loading}
          onClick={handleSave}
          sx={{ minWidth: 100 }}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
