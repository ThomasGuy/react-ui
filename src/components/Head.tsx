import { useState } from "react";
import { Button, Modal, Skeleton } from "@mui/material";

import "../styles/head.css";
import { HeadProps } from "./types";
import NewPost from "./modals/NewPost";
import Login from "./modals/login";
import SignUp from "./modals/signUp";
import { useAuth } from "./AuthContext";

const Head = ({ setPosts, view, setView }: HeadProps) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);

  // Grab everything we need from Context
  const { logout, isLoading, user } = useAuth();

  if (isLoading) {
    return <Skeleton />; // Or a nice MUI Skeleton
  }

  return (
    <div className="head">
      <Modal open={loginOpen} onClose={() => setLoginOpen(false)}>
        <Login onSuccess={() => setLoginOpen(false)} />
      </Modal>

      <Modal open={openSignUp} onClose={() => setOpenSignUp(false)}>
        <SignUp onSuccess={() => setOpenSignUp(false)} />
      </Modal>

      <Modal open={newPostOpen} onClose={() => setNewPostOpen(false)}>
        <NewPost setPosts={setPosts} onSuccess={() => setNewPostOpen(false)} />
      </Modal>

      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
        alt="instagram"
      />

      {isLoading ? (
        // 1. Show Pulse Skeletons while checking the JWT
        <div className="skeleton">
          <Skeleton variant="rounded" />
          <Skeleton variant="rounded" className="skeleton-margin" />
        </div>
      ) : user ? (
        <div>
          {view.type === "profile" && (
            <Button
              variant="contained"
              onClick={() => setView({ type: "feed" })}
            >
              Back
            </Button>
          )}

          {/* New Admin Button */}
          {user.isAdmin && view.type !== "admin_users" && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setView({ type: "admin_users" })}
              sx={{ mr: 2 }}
            >
              Admin
            </Button>
          )}

          {view.type === "admin_users" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setView({ type: "feed" })}
              sx={{ mr: 2 }}
            >
              Back to Feed
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={() => setNewPostOpen(true)}
            sx={{ mr: 2 }}
          >
            New Post
          </Button>

          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
            onClick={logout}
          >
            Log Out
          </Button>
        </div>
      ) : (
        <div>
          {view.type === "profile" && (
            <Button
              variant="contained"
              onClick={() => setView({ type: "feed" })}
            >
              Back
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={() => setLoginOpen(true)}
            sx={{ mr: 2 }}
          >
            LOGIN
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenSignUp(true)}
            sx={{ mr: 2 }}
          >
            SIGNUP
          </Button>
        </div>
      )}
    </div>
  );
};

export default Head;
