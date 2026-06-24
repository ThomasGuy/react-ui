import {
  AppBar,
  Box,
  Container,
  Grid,
  IconButton,
  Modal,
  Skeleton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { HeadProps } from '../utils/types';
import { useState } from 'react';
import { Login, SignUp, NewPost } from './modals';
import {
  ArrowBack,
  Login as LoginIcon,
  Logout,
  PostAdd,
  Settings,
  Subscriptions,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Head = (props: HeadProps) => {
  const { setFeedPosts, view, setView, ...appBarProps } = props;
  const [loginOpen, setLoginOpen] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);

  // Grab everything we need from Context
  const { logout, isLoading, currentUser, userData } = useAuth();

  if (isLoading) {
    return <Skeleton />;
  }

  const backHandler = () => {
    setView({ type: 'feed' });
    window.scrollTo(0, 0);
  };

  const titleName =
    `${userData?.username}`.charAt(0).toUpperCase() + `${userData?.username}`.slice(1);
  const viewName = `${view.username}`.charAt(0).toUpperCase() + `${view.username}`.slice(1);
  const title =
    currentUser && view.type === 'feed'
      ? `${titleName}`
      : view.type === 'profile'
        ? `${viewName}'s profile`
        : 'Instaclone';

  return (
    <AppBar position="sticky" color="inherit" {...appBarProps}>
      <Container maxWidth="lg">
        {/* Keeps header aligned with your Post cards */}
        <Toolbar disableGutters>
          <Modal open={loginOpen} onClose={() => setLoginOpen(false)}>
            <Login onSuccess={() => setLoginOpen(false)} />
          </Modal>

          <Modal open={openSignUp} onClose={() => setOpenSignUp(false)}>
            <SignUp onSuccess={() => setOpenSignUp(false)} />
          </Modal>

          <Modal open={newPostOpen} onClose={() => setNewPostOpen(false)}>
            <NewPost setPosts={setFeedPosts} onSuccess={() => setNewPostOpen(false)} />
          </Modal>

          <Grid container sx={{ alignItems: 'center', width: '100%' }} spacing={1}>
            <Grid size={{ xs: 'auto', sm: 3 }}>
              <Box
                component="img"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
                alt="Logo"
                sx={{ height: 40, width: 'auto', display: { xs: 'none', sm: 'block' } }}
              />
            </Grid>

            <Grid sx={{ flexGrow: 1 }}>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '100%',
                  display: { xs: 'none', sm: 'block' },
                  fontSize: {
                    sm: '1.5rem', // roughly h5 size
                    lg: '2.125rem', // roughly h4 size
                  },
                }}
              >
                {`${title}`}
              </Typography>
            </Grid>

            <Grid
              sx={{
                width: { xs: '100%', sm: 'auto' },
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
              <Stack
                direction="row"
                spacing={2}
                sx={{ justifyContent: { xs: 'center', sm: 'flex-end' } }}
              >
                {isLoading ? (
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
                      <IconButton
                        color="secondary"
                        onClick={() => setView({ type: 'admin_users' })}
                      >
                        <Settings />
                      </IconButton>
                    )}

                    {view.type === 'feed' && (
                      <IconButton onClick={() => setNewPostOpen(true)}>
                        <PostAdd />
                      </IconButton>
                    )}

                    <IconButton onClick={logout}>
                      <Logout />
                    </IconButton>
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

                    <IconButton onClick={() => setOpenSignUp(true)}>
                      <Subscriptions />
                    </IconButton>
                  </>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Head;
