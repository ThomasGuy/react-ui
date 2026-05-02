import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

import "../../styles/head.css";
import { ISuccess } from "../props";
import { style } from "./modal_style";
import { useAuth } from "../AuthContext";

const Login = ({ onSuccess }: ISuccess) => {
  const [username, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const { authFetch, login } = useAuth();

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
        body: JSON.stringify(loginData),
      };
      const response = await authFetch(`user/login`, requestOptions);

      if (response.ok) {
        const data = await response.json();
        login(data);
        onSuccess();
      }
    } catch (error) {
      console.error("Fetch error: ", error);
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
          <center>Login</center>
        </Typography>
      </div>
      <form className="login">
        <TextField
          className="button"
          placeholder="username"
          type="text"
          value={username}
          onChange={(evt) => setLoginName(evt.target.value)}
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
  );
};

export default Login;
