import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

import "../../styles/head.css";
import { style } from "./modal_style";
import { ISuccess } from "../types";
import { useAuth } from "../AuthContext";

const SignUp = ({ onSuccess }: ISuccess) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { authFetch } = useAuth();

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
        body: json_string,
      };

      const response = await authFetch("user/signup", requestOptions);
      if (!response.ok) {
        throw new Error("register user failed");
      }

      onSuccess();
    } catch (error) {
      console.error("Fetch error: ", error);
      alert(error);
    }
  };

  return (
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
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={handleSignUp}
        >
          submit
        </Button>
      </form>
    </Box>
  );
};

export default SignUp;
