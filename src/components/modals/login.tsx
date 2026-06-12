import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ISuccess } from '../types';
import { style } from './modal_style';
import { useAuth } from '../../context/AuthContext';
import { VisibilityOff, Visibility } from '@mui/icons-material';

export const Login = ({ onSuccess }: ISuccess) => {
  const [username, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [warning, setWarning] = useState('');
  const { authFetch, login } = useAuth();

  const passwordRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (
    evt: React.KeyboardEvent<HTMLDivElement>,
    nextRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    if (evt.key === 'Enter') {
      evt.preventDefault(); // Stop the form from submitting early
      nextRef.current?.focus(); // Hop cursor to the next field
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    try {
      const cleanUsername = username.trim();
      const loginData = {
        username: cleanUsername as string,
        password: password as string,
      };
      const requestOptions = {
        method: 'POST',
        body: JSON.stringify(loginData),
      };
      const response = await authFetch(`/user/login`, requestOptions);

      if (response.status == 401) {
        setLoginName('');
        setPassword('');
        setWarning('Incorrect username and/or password');
      } else if (response.ok) {
        const data = await response.json();
        login(data);
        onSuccess();
      }
    } catch (error) {
      console.error('Fetch error: ', error);
    }
  };

  return (
    <Box sx={style}>
      <Stack direction="row" sx={{ mb: 3, alignItems: 'center' }} spacing={2}>
        <Box
          component="img"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
          alt="instagram"
          sx={{ height: 30, width: 'auto', display: { xs: 'none', sm: 'block' } }}
        />
        <Typography id="modal-login-title" variant="h5" sx={{ flexGrow: 1, textAlign: 'center' }}>
          Login
        </Typography>
        <Box sx={{ width: { xs: 0, sm: '30px' } }} />
      </Stack>
      <form onSubmit={handleLogin}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            name="username"
            placeholder="username"
            type="text"
            value={username}
            onChange={(evt) => setLoginName(evt.target.value)}
            autoComplete="username"
            onKeyDown={(e) => handleKeyDown(e, passwordRef)}
            slotProps={{ htmlInput: { enterKeyHint: 'next' } }}
          />
          <TextField
            name="password"
            placeholder="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(evt) => setPassword(evt.target.value)}
            autoComplete="current-password"
            inputRef={passwordRef}
            slotProps={{
              htmlInput: { enterKeyHint: 'done' },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button variant="text" color="primary" type="submit" disabled={!password || !username}>
            SUBMIT
          </Button>
          {warning && <Typography color="error">{warning}</Typography>}
        </Stack>
      </form>
    </Box>
  );
};
