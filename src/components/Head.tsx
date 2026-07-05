import { useState } from 'react';
import { AppBar, Box, Container, IconButton, Skeleton, Toolbar, Typography } from '@mui/material';
import {
  ArrowBack,
  Login as LoginIcon,
  PostAdd,
  Settings,
  Subscriptions,
} from '@mui/icons-material';

import { LoginModal, SignUpModal, NewPostModal } from './modals';
import { HeadProps } from '../utils/types';
import { useAuth } from '../context/AuthContext';
import { UserProfileMenu } from './UserProfileMenu';
import { capitalize } from '@/utils/helpers';

const Head = (props: HeadProps) => {
  const { setFeedPosts, view, setView, ...appBarProps } = props;
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);

  const { isInitializing, currentUser, userData } = useAuth();

  if (isInitializing) {
    return <Skeleton />;
  }

  const backHandler = () => {
    setView({ type: 'feed' });
    window.scrollTo(0, 0);
  };

  const title =
    currentUser && view.type === 'feed'
      ? capitalize(userData?.username)
      : view.type === 'profile'
        ? `${capitalize(view.username)}'s profile`
        : 'Instaclone';

  return (
    <AppBar position="sticky" color="inherit" elevation={1} {...appBarProps}>
      <Container maxWidth="lg">
        {/* Keeps header aligned with your Post cards */}
        <Toolbar disableGutters>
          <LoginModal open={loginOpen} signUp={setSignUpOpen} onClose={() => setLoginOpen(false)} />

          <SignUpModal open={signUpOpen} onClose={() => setSignUpOpen(false)} />

          <NewPostModal
            open={newPostOpen}
            onClose={() => setNewPostOpen(false)}
            setPosts={setFeedPosts}
          />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between',
              '& .MuiIconButton-root:not(.MuiIconButton-colorSecondary)': {
                color: '#ccc',
              },
              '& .MuiIconButton-root .MuiSvgIcon-root': {
                fontSize: '2rem',
              },
              '& .MuiIconButton-root': {
                mx: { xs: 1, sm: 2 },
              },
            }}
          >
            {/* 👈 LEFT ZONE: Avatar Dropdown Profile Trigger Menu */}
            <Box
              sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
            >
              <UserProfileMenu setView={setView} />
            </Box>

            {/* 🎯 MIDDLE ZONE: Centralized Dynamic Context Title */}
            <Box sx={{ minWidth: 0, px: 2, textAlign: 'center' }}>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 'bold',
                  letterSpacing: '-0.5px',
                  fontSize: { xs: '1.1rem', sm: '1.4rem', md: '1.75rem' },
                }}
              >
                {title}
              </Typography>
            </Box>

            {/* 👉 RIGHT ZONE: Dynamic Action Button Panel Strip */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1 },
              }}
            >
              {isInitializing ? (
                // 1. Show Pulse Skeletons while checking the JWT
                <>
                  <Skeleton variant="rounded" />
                  <Skeleton variant="rounded" className="skeleton-margin" />
                </>
              ) : currentUser ? (
                <>
                  {['profile', 'admin_users'].includes(view.type) && (
                    <IconButton onClick={() => backHandler()}>
                      <ArrowBack />
                    </IconButton>
                  )}

                  {/* Admin Button */}
                  {currentUser.isAdmin && view.type !== 'admin_users' && (
                    <IconButton color="secondary" onClick={() => setView({ type: 'admin_users' })}>
                      <Settings />
                    </IconButton>
                  )}

                  {view.type === 'feed' && (
                    <IconButton onClick={() => setNewPostOpen(true)}>
                      <PostAdd />
                    </IconButton>
                  )}
                </>
              ) : (
                <>
                  {view.type === 'profile' && (
                    <IconButton onClick={() => backHandler()}>
                      <ArrowBack />
                    </IconButton>
                  )}

                  <IconButton onClick={() => setLoginOpen(true)}>
                    <LoginIcon />
                  </IconButton>

                  <IconButton onClick={() => setSignUpOpen(true)}>
                    <Subscriptions />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Head;
