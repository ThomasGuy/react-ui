/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, cloneElement, ReactElement } from "react";
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
} from "@mui/material";

import { IPost, Uuid } from "./types";
import Post from "./MuiPost";
import Head from "./MuiHead";
import { useAuth } from "./AuthContext";
import { AdminUserList } from "./Admin";

function App() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [view, setView] = useState<{
    type: "feed" | "profile" | "admin_users";
    username?: string;
  }>({ type: "feed" });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<Uuid | null>(null);
  const { authFetch, user, authUsername } = useAuth();

  useEffect(() => {
    if (view.type === "admin_users" || (view.type === "profile" && !view.username)) return;

    const endpoint = view.type === "profile" ? `post/user/${view.username}` : "post/all"; // all_posts route

    authFetch(endpoint)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        // console.log("Raw Post date: ", data);
        const formatted: IPost[] = data.map((post: any) => ({
          ...post,
          timestamp: new Date(post.timestamp),
          user: { username: post.user.username },
        }));
        setPosts(formatted);
      })
      .catch((err) => console.error("Fetch error view:", err));
  }, [view, authFetch]); // Re-fetch whenever the view changes

  const handleDeleteClick = (id: Uuid, username: string) => {
    if (user && authUsername == username) {
      setSelectedPostId(id);
      setOpenDialog(true);
    } else {
      handleDialogClose();
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedPostId(null);
  };

  const handleConfirmDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (selectedPostId) {
      const response = await authFetch(`post/delete/${selectedPostId}`, {
        method: "DELETE",
      });

      if (response.status == 403) {
        alert("Unauthorized -- not your post --");
      } else if (response.ok) {
        // 1. Instantly remove the post from the UI
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== selectedPostId));
      }
      handleDialogClose();
    }
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
        backgroundColor: trigger ? "rgba(114, 99, 99, 0.6)" : "transparent", // Slightly translucent
        backdropFilter: trigger ? "blur(8px)" : "none", // Modern blur effect
        transition: "all 0.3s ease-in-out",
      },
    });
  }

  // Helper function to render the "Center Piece" of your app
  const renderContent = () => {
    switch (view.type) {
      case "admin_users":
        return user?.isAdmin ? <AdminUserList /> : <div>Access Denied</div>;

      case "profile":
      case "feed":
      default:
        return posts.map((post) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
            <Post
              key={post.id}
              post={post}
              setPosts={setPosts}
              setView={setView}
              onDeleteRequest={handleDeleteClick}
            />
          </Grid>
        ));
    }
  };

  return (
    <>
      <ElevationScroll>
        <Head setPosts={setPosts} view={view} setView={setView} />
      </ElevationScroll>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {renderContent()}

          <Dialog
            open={openDialog}
            onClose={handleDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Delete Post?"}</DialogTitle>
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
        </Grid>
      </Container>
    </>
  );
}

export default App;
