import React, { useState } from 'react';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import { Settings, Logout, AccountCircle } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { EditProfileModal } from './modals/EditProfileModal';
import { getInstacloneAvatarUrl } from '@/utils/sanityImage';
import { ISetViewFn } from '@/utils/types';

interface IUserProfileMenuProps {
  setView: ISetViewFn;
}

export const UserProfileMenu = ({ setView }: IUserProfileMenuProps) => {
  const { userData, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (!userData) return null;

  const isMenuOpen = Boolean(anchorEl);
  const initial = userData.username.charAt(0).toUpperCase();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenEditModal = () => {
    setModalOpen(true);
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    logout();
    setView({ type: 'feed' });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        onClick={handleMenuOpen}
        size="small"
        aria-controls={isMenuOpen ? 'profile-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={isMenuOpen ? 'true' : undefined}
        sx={{ p: 0, border: '2px solid transparent', '&:hover': { borderColor: 'primary.main' } }}
      >
        <Avatar
          src={getInstacloneAvatarUrl(userData.avatarUrl || undefined)}
          sx={{
            width: 48,
            height: 48,
            fontSize: '1.15rem',
            fontWeight: 'bold',
            alignContent: 'center',
          }}
        >
          {!userData.avatarUrl && initial}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="profile-menu"
        open={isMenuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
              mt: 1.5,
              width: 200,
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold' }}>
            {userData.displayName || userData.username}
          </Typography>
          {userData.displayName && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              @{userData.username}
            </Typography>
          )}
        </Box>

        <Divider />

        <MenuItem onClick={handleOpenEditModal}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Edit Info
        </MenuItem>

        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" color="info" />
          </ListItemIcon>
          Log out
        </MenuItem>
      </Menu>

      <EditProfileModal open={modalOpen} onClose={() => setModalOpen(false)} user={userData} />
    </Box>
  );
};
