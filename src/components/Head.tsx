import React, { useState } from "react";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";

import "../styles/head.css";
import { IAuthState, Uuid } from "./props";
import { style } from "./modals/modal_style";
import NewPost from "./modals/NewPost";

const BASE_URL = "http://127.0.0.1:8000/";

const Head = ({
  authToken,
  setAuthToken,
  authTokenType,
  setAuthTokenType,
  username,
  setUsername,
  setUserId,
  setPosts,
}: IAuthState) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  const handleLogin = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e?.preventDefault();
    try {
      const loginData = {
        username: username as string,
        password: password as string,
      };
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // MUST be present
        },
        body: JSON.stringify(loginData),
      };
      const response = await fetch(BASE_URL + "user/login", requestOptions);

      if (response.status === 401 || response.status === 404) {
        alert("Invalid email or password. Please try again.");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.authToken);
        setAuthTokenType(data.authTokenType);
        setUserId(data.user.id as Uuid);
        setUsername(data.user.username);
        setLoginOpen(false);
      }
    } catch (error) {
      console.error("Fetch error: ", error);
    }
  };

  const handleLogout = (
    evt: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    evt.preventDefault();
    setAuthToken(null);
    setAuthTokenType(null);
    setUserId(null);
    setUsername(null);
    setPassword(null);
    window.localStorage.clear();
    setLoginOpen(true);
  };

  const handleSignUp = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e?.preventDefault();

    try {
      const json_string = JSON.stringify({
        username: username,
        email: email,
        password: password,
      });
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json_string,
      };

      const response = await fetch(BASE_URL + "user/signup", requestOptions);
      if (!response.ok) {
        throw new Error("register user failed");
      }

      setOpenSignUp(false);
    } catch (error) {
      console.error("Fetch error: ", error);
      alert(error);
    }
  };

  return (
    <div className="head">
      <Modal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        aria-labelledby="modal-modal-title"
      >
        <Box sx={style}>
          <div className="login_title">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
              alt="instagram"
            />
            <Typography id="modal-modal-title" variant="h6" component="h2">
              <center>Login</center>
            </Typography>
          </div>
          <form className="login">
            <TextField
              className="button"
              placeholder="username"
              type="text"
              value={username}
              onChange={(evt) => setUsername(evt.target.value)}
            />
            <br />
            <TextField
              className="button"
              placeholder="password"
              type="password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
            />
            <br />
            <Button type="submit" onClick={handleLogin}>
              Login
            </Button>
          </form>
        </Box>
      </Modal>

      <Modal
        open={openSignUp}
        onClose={() => setOpenSignUp(false)}
        aria-labelledby="modal-modal-title"
      >
        <Box sx={style}>
          <div className="login_title">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
              alt="instagram"
            />
            <Typography id="modal-modal-title" variant="h6" component="h2">
              <center>New user</center>
            </Typography>
          </div>
          <form className="login">
            <TextField
              className="button"
              placeholder="username"
              type="text"
              value={username}
              onChange={(evt) => setUsername(evt.target.value)}
            />
            <br />
            <TextField
              className="button"
              placeholder="email"
              type="text"
              value={email}
              onChange={(evt) => setEmail(evt.target.value)}
            />
            <br />
            <TextField
              className="button"
              placeholder="password"
              type="password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
            />
            <br />
            <Button type="submit" onClick={handleSignUp}>
              submit
            </Button>
          </form>
        </Box>
      </Modal>

      <Modal
        open={newPostOpen}
        onClose={() => setNewPostOpen(false)}
        aria-labelledby="modal-modal-title"
      >
        <NewPost
          authToken={authToken}
          authTokenType={authTokenType}
          setPosts={setPosts}
          onSuccess={() => setNewPostOpen(false)}
        />
      </Modal>

      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
        alt="instagram"
      />
      {authToken ? (
        <div>
          <Button variant="outlined" onClick={() => setNewPostOpen(true)}>
            New Post
          </Button>
          <Button variant="outlined" onClick={handleLogout}>
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
