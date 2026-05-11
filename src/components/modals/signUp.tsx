import React, { useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

import { style } from "./modal_style";
import { ISuccess } from "../types";
import { useAuth } from "../AuthContext";

export const SignUp = ({ onSuccess }: ISuccess) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [warning, setWarning] = useState("");
  const { authFetch } = useAuth();

  const handleSignUp = async (evt: React.SubmitEvent<HTMLFormElement>) => {
    evt?.preventDefault();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    try {
      const json_string = JSON.stringify({
        username: cleanUsername,
        email: cleanEmail,
        password: password,
      });
      const requestOptions = {
        method: "POST",
        body: json_string,
      };

      const response = await authFetch("user/signup", requestOptions);

      if (response.status == 409) {
        setEmail("");
        setUsername("");
        setWarning("username and/or email already taken");
      } else if (!response.ok) {
        throw new Error("register user failed");
      } else if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Fetch error: ", error);
      alert(error);
    }
  };

  return (
    <Box sx={style}>
      <Stack direction="row" sx={{ mb: 3, alignItems: "center" }} spacing={2}>
        <Box
          component="img"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
          alt="instagram"
          sx={{ height: 30, width: "auto", display: { xs: "none", sm: "block" } }}
        />
        <Typography id="modal-signup-title" variant="h5" sx={{ flexGrow: 1, textAlign: "center" }}>
          New user
        </Typography>
        <Box sx={{ width: { xs: 0, sm: "30px" } }} />
      </Stack>

      <form onSubmit={handleSignUp}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            name="username"
            placeholder="username"
            type="text"
            value={username}
            onChange={(evt) => setUsername(evt.target.value)}
          />
          <TextField
            name="email"
            placeholder="email"
            type="text"
            value={email}
            onChange={(evt) => setEmail(evt.target.value)}
          />
          <TextField
            name="password"
            placeholder="password"
            type="password"
            value={password}
            onChange={(evt) => setPassword(evt.target.value)}
          />
          <Button
            variant="text"
            color="primary"
            type="submit"
            disabled={!password || !username || !email}
          >
            SUBMIT
          </Button>
          {warning && <Typography color="error">{warning}</Typography>}
        </Stack>
      </form>
    </Box>
  );
};
