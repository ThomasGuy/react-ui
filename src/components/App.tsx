/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, cloneElement, ReactElement, useCallback } from 'react';
import {
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useScrollTrigger,
  Grid,
  Box,
  CircularProgress,
} from '@mui/material';

import { IPost, Uuid } from './types';
import Post from './MuiPost';
import Head from './MuiHead';
import { useAuth } from '../context/AuthContext';
import { AdminUserList } from './Admin';
import { ProfileGrid } from './ProfileGrid';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

function App() {
  const [feedPosts, setFeedPosts] = useState<IPost[]>([]);
  const [profilePosts, setProfilePosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<{
    type: 'feed' | 'profile' | 'admin_users';
    username?: string;
  }>({ type: 'feed' });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<Uuid | null>(null);
  const [selectedProfilePost, setSelectedProfilePost] = useState<IPost | null>(null);
  const [isLiking, setIsLiking] = useState(false);

  // Separate tracking checks to monitor if the database has run dry for a view
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [profileHasMore, setProfileHasMore] = useState(true);

  const { authFetch, user, authUsername } = useAuth();

  // --- PAGINATION LOADER ENGINE ---
  const fetchMoreData = useCallback(
    async (forcedOffset?: number) => {
      if (loading) return;

      const isProfile = view.type === 'profile';
      // If a forcedOffset number is provided, use it. Otherwise, fallback to array lengths.
      const currentOffset =
        forcedOffset !== undefined
          ? forcedOffset
          : isProfile
            ? profilePosts.length
            : feedPosts.length;

      // Guard check: If offset is 0 but we already have data running, abort duplicate
      if (currentOffset === 0 && loading) return;
      setLoading(true);

      const endpoint = isProfile
        ? `/post/user/${view.username}?offset=${currentOffset}`
        : `/post/all?offset=${currentOffset}`;

      try {
        const res = await authFetch(endpoint);
        if (res.ok) {
          const data = await res.json();

          const formatted: IPost[] = data.map((post: any) => ({
            ...post,
            timestamp: new Date(post.createdAt),
            user: { username: post.user.username },
            comments: post.comments || [],
            likesCount: post.likesCount || 0,
            hasLiked: post.hasLiked || false,
          }));

          if (isProfile) {
            setProfilePosts((prev) => (currentOffset === 0 ? formatted : [...prev, ...formatted]));
            if (formatted.length < 60) setProfileHasMore(false);
          } else {
            setFeedPosts((prev) => (currentOffset === 0 ? formatted : [...prev, ...formatted]));
            if (formatted.length < 20) setFeedHasMore(false);
          }
        }
      } catch (err) {
        console.error('Pagination error:', err);
      } finally {
        setLoading(false);
      }
    },
    [view, feedPosts.length, profilePosts.length, loading, authFetch],
  );

  // Reset pagination flags whenever the target view switches
  useEffect(() => {
    // Always unlock the home feed boundaries when resetting layout views
    setFeedHasMore(true);
    setProfileHasMore(true);

    if (view.type === 'profile') {
      setProfilePosts([]);
      fetchMoreData(0);
    } else {
      setFeedPosts([]);
      fetchMoreData(0);
    }
  }, [view.type, view.username, user]);

  // Bind the infinite scroll boundary anchor
  const bottomRef = useInfiniteScroll({
    loading,
    onLoadMore: fetchMoreData,
    hasMore: view.type === 'profile' ? profileHasMore : feedHasMore,
    postsLength: view.type === 'profile' ? profilePosts.length : feedPosts.length,
  });

  // ------------------- Handle Comment CLick ------------------------

  const handlePostCommentClick = async (
    evt: React.SubmitEvent<HTMLFormElement>,
    postId: Uuid,
    comment: string,
  ) => {
    evt.preventDefault();

    const response = await authFetch('/post/comment', {
      method: 'POST',
      body: JSON.stringify({
        postId,
        comment,
      }),
    });

    if (response.ok) {
      const createdComment = await response.json();

      // 1. Route the dispatcher dynamically based on the active SPA view context
      const setTargetPostsState = view.type === 'profile' ? setProfilePosts : setFeedPosts;

      setTargetPostsState((prevPosts: IPost[]) =>
        prevPosts.map((p) =>
          p.id === postId ? { ...p, comments: [createdComment, ...p.comments] } : p,
        ),
      );
    }
  };

  //  ------------------- Handle Like Click --------------------------

  const handleLikeClick = async (targetPostId: Uuid) => {
    if (!user) {
      alert('Login to like posts!');
      return;
    }
    if (isLiking) return;
    setIsLiking(true);

    try {
      const res = await authFetch(`/post/like/${targetPostId}`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json(); // Expected response: { status: "liked" | "unliked" }
        const isLikedResult = data.status === 'liked';

        // 1. Route the dispatcher dynamically based on the active SPA view context
        const setTargetPostsState = view.type === 'profile' ? setProfilePosts : setFeedPosts;

        // 2. Perform an atomic update loop using a fresh collection snapshot (p)
        setTargetPostsState((prev: IPost[]) =>
          prev.map((p) => {
            if (p.id !== targetPostId) return p;

            // Always read properties straight out of 'p' (the latest state reference),
            // never from the historic top-level 'post' variable closure!
            return {
              ...p,
              hasLiked: isLikedResult,
              likesCount: isLikedResult
                ? (p.likesCount ?? 0) + 1
                : Math.max(0, (p.likesCount ?? 1) - 1), // Prevent negative counts safely
            };
          }),
        );
      }
    } catch (err) {
      console.error('Like synchronization operation failed:', err);
    } finally {
      setIsLiking(false); // Clean execution unlock
    }
  };

  //  --------------- Delete Post Block -------------------

  const handleDeleteClick = (id: Uuid, username: string) => {
    if (user && authUsername == username) {
      setSelectedPostId(id);
      setOpenDialog(true);
    } else {
      handleDialogClose();
    }
  };

  const handleConfirmDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (selectedPostId) {
      const response = await authFetch(`/post/delete/${selectedPostId}`, {
        method: 'DELETE',
      });

      if (response.status == 403) {
        alert('Unauthorized -- not your post --');
      } else if (response.ok) {
        // 1. Instantly remove the post from the UI
        setFeedPosts((prevPosts) => prevPosts.filter((p) => p.id !== selectedPostId));
      }
      handleDialogClose();
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedPostId(null);
  };

  interface Props {
    children: ReactElement<any>;
  }

  function ElevationScroll(props: Props) {
    const { children } = props;

    // trigger will be true when scroll > 0
    const trigger = useScrollTrigger({
      disableHysteresis: true, // Appears immediately on scroll
      threshold: 0, // Scroll distance before triggering
    });

    return cloneElement(children, {
      elevation: trigger ? 4 : 0, // Adds shadow (elevation 4) when scrolled
      sx: {
        ...children.props.sx,
        backgroundColor: trigger ? 'rgba(114, 99, 99, 0.6)' : 'transparent', // Slightly translucent
        backdropFilter: trigger ? 'blur(8px)' : 'none', // Modern blur effect
        transition: 'all 0.3s ease-in-out',
      },
    });
  }

  // Helper function to render the "Center Piece"

  const renderContent = () => {
    switch (view.type) {
      case 'admin_users':
        return (
          <Grid size={12}>{user?.isAdmin ? <AdminUserList /> : <div>Access Denied</div>}</Grid>
        );

      case 'profile': {
        // 1. Locate the dynamic, updated post from your active profile state array cache
        const activeModalPost = profilePosts.find((p) => p.id === selectedProfilePost?.id);

        return (
          <Grid size={12}>
            <ProfileGrid profilePosts={profilePosts} onPostClick={setSelectedProfilePost} />
            {/* Target sentinel element tracking node */}
            <div ref={bottomRef} style={{ height: '10px', width: '100%' }} />
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {/* 2. The Persistent Post Focus Detail View Modal Window Overlay */}
            <Dialog
              open={Boolean(selectedProfilePost)} // Open state scales dynamically based on data availability
              onClose={() => setSelectedProfilePost(null)} // Wipes focus to close overlay cleanly
              // maxWidth="sm"
              fullWidth
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: 2,
                    overflow: 'hidden',
                    // bgcolor: "background.paper",
                    bgcolor: (theme) => `rgba(${theme.palette.background.paper}, 0.3)`,
                    maxWidth: { xs: '350px', sm: '550px' },
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                },
              }}
            >
              {activeModalPost && (
                <Box
                  component={DialogContent}
                  sx={{
                    p: { xs: 1, sm: 2 },
                    maxWidth: { xs: '300px', sm: '450px' },
                  }}
                >
                  {/* Reuses your existing Post component engine seamlessly */}
                  <Post
                    post={activeModalPost}
                    setView={setView}
                    onDeleteRequest={handleDeleteClick}
                    onLikeRequest={handleLikeClick}
                    onCommentRequest={handlePostCommentClick}
                  />
                </Box>
              )}
            </Dialog>
          </Grid>
        );
      }

      case 'feed':
        return (
          <>
            {feedPosts.map((post) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={post.id}>
                <Post
                  post={post}
                  setView={setView}
                  onDeleteRequest={handleDeleteClick}
                  onLikeRequest={handleLikeClick}
                  onCommentRequest={handlePostCommentClick}
                />
              </Grid>
            ))}
            {/* Target sentinel element tracking node */}
            <Grid size={12} ref={bottomRef} style={{ minHeight: '10px' }}>
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={30} />
                </Box>
              )}
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <ElevationScroll>
        <Head setFeedPosts={setFeedPosts} view={view} setView={setView} />
      </ElevationScroll>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {renderContent()}
        </Grid>
      </Container>

      {/* Persistent Overlay Dialog Boxes */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Delete Post?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default App;
