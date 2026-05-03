import { useState } from "react";
import { Button, Modal } from "@mui/material";

import "../styles/head.css";
import { HeadProps } from "./props";
import NewPost from "./modals/NewPost";
import Login from "./modals/login";
import SignUp from "./modals/signUp";
import { useAuth } from "./AuthContext";

const Head = ({ setPosts }: HeadProps) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);

  // Grab everything we need from Context
  const { authToken, logout } = useAuth();
  const isLoggedIn = !!authToken;

  return (
    <div className="head">
      <Modal open={loginOpen} onClose={() => setLoginOpen(false)}>
        {/* Login now handles its own state updates internally via useAuth */}
        <Login onSuccess={() => setLoginOpen(false)} />
      </Modal>

      <Modal open={openSignUp} onClose={() => setOpenSignUp(false)}>
        <SignUp onSuccess={() => setOpenSignUp(false)} />
      </Modal>

      <Modal open={newPostOpen} onClose={() => setNewPostOpen(false)}>
        {/* NewPost no longer needs tokens passed as props! */}
        <NewPost setPosts={setPosts} onSuccess={() => setNewPostOpen(false)} />
      </Modal>

      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
        alt="instagram"
      />

      {isLoggedIn ? (
        <div>
          <Button variant="outlined" onClick={() => setNewPostOpen(true)}>
            New Post
          </Button>
          {/* logout() is now a one-liner from context */}
          <Button variant="outlined" onClick={logout}>
            Log Out
          </Button>
        </div>
      ) : (
        <div>
          <Button variant="outlined" onClick={() => setLoginOpen(true)}>
            LOGIN
          </Button>
          <Button variant="outlined" onClick={() => setOpenSignUp(true)}>
            SIGNUP
          </Button>
        </div>
      )}
    </div>
  );
};

export default Head;
