import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Modal,
  Skeleton,
  Box,
  Grid,
  Stack,
} from "@mui/material";
import { HeadProps } from "./types";
import { useState } from "react";
import { Login, SignUp, NewPost } from "./modals";
import { useAuth } from "./AuthContext";

const Head = (props: HeadProps) => {
  const { setFeedPosts, view, setView, ...appBarProps } = props;
  const [loginOpen, setLoginOpen] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);

  // Grab everything we need from Context
  const { logout, isLoading, user, authUsername } = useAuth();

  if (isLoading) {
    return <Skeleton />;
  }

  const backHandler = () => {
    setView({ type: "feed" });
    window.scrollTo(0, 0);
  };

  const titleName = `${authUsername}`.charAt(0).toUpperCase() + `${authUsername}`.slice(1);

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

          <Grid container sx={{ alignItems: "center", width: "100%" }} spacing={1}>
            <Grid size={{ xs: "auto", sm: 3 }}>
              <Box
                component="img"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
                alt="Logo"
                sx={{ height: 40, width: "auto", display: { xs: "none", sm: "block" } }}
              />
            </Grid>

            <Grid sx={{ flexGrow: 1 }}>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "100%",
                  display: { xs: "none", sm: "block" },
                  fontSize: {
                    sm: "1.5rem", // roughly h5 size
                    lg: "2.125rem", // roughly h4 size
                  },
                }}
              >
                {user ? `${titleName}` : "Mui-App"}
              </Typography>
            </Grid>

            <Grid sx={{ width: { xs: "100%", sm: "auto" } }}>
              <Stack
                direction="row"
                spacing={2}
                sx={{ justifyContent: { xs: "center", sm: "flex-end" } }}
              >
                {isLoading ? (
                  // 1. Show Pulse Skeletons while checking the JWT
                  <>
                    <Skeleton variant="rounded" />
                    <Skeleton variant="rounded" className="skeleton-margin" />
                  </>
                ) : user ? (
                  <>
                    {view.type === "profile" && (
                      <Button variant="contained" color="primary" onClick={() => backHandler()}>
                        Back
                      </Button>
                    )}

                    {/* Admin Button */}
                    {user.isAdmin && view.type !== "admin_users" && (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setView({ type: "admin_users" })}
                      >
                        Admin
                      </Button>
                    )}

                    {view.type === "admin_users" && (
                      <Button variant="contained" color="primary" onClick={() => backHandler()}>
                        Back
                      </Button>
                    )}

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setNewPostOpen(true)}
                    >
                      New Post
                    </Button>

                    <Button variant="contained" color="primary" onClick={logout}>
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    {view.type === "profile" && (
                      <Button variant="contained" color="primary" onClick={() => backHandler()}>
                        Back
                      </Button>
                    )}

                    <Button variant="contained" color="primary" onClick={() => setLoginOpen(true)}>
                      LOGIN
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => setOpenSignUp(true)}>
                      SIGNUP
                    </Button>
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
