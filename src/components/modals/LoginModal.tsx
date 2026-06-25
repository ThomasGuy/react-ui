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

import { ILoginResponse, ISuccess } from '@/utils/types';
import { useAuth } from '@/context/AuthContext';
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
      evt.preventDefault();
      nextRef.current?.focus();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    try {
      const cleanUsername = username.trim();
      const loginData = {
        username: cleanUsername,
        password: password,
      };
      const requestOptions = {
        method: 'POST',
        body: JSON.stringify(loginData),
      };
      const response = await authFetch(`/user/login`, requestOptions);

      if (response.status === 401) {
        setLoginName('');
        setPassword('');
        setWarning('Incorrect username and/or password');
      } else if (response.ok) {
        const newLoginData = (await response.json()) as ILoginResponse;
        login(newLoginData);
        onSuccess();
      }
    } catch (error) {
      console.error('Fetch error: ', error);
    }
  };

  return (
    // 🚀 Container now acts purely as a responsive layout boundaries wrapper inside Dialog panel
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Stack
        direction="row"
        sx={{ mb: 4, alignItems: 'center', justifyContent: 'center' }}
        spacing={1.5}
      >
        <Box
          component="img"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
          alt="instagram"
          sx={{ height: 32, width: 'auto' }}
        />
        <Typography
          variant="h5"
          sx={{ fontWeight: '800', trackingSpacing: '-0.5px', color: 'text.primary' }}
        >
          Login
        </Typography>
      </Stack>

      <form onSubmit={handleLogin}>
        <Stack spacing={2.5}>
          <TextField
            name="username"
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(evt) => setLoginName(evt.target.value)}
            autoComplete="username"
            onKeyDown={(e) => handleKeyDown(e, passwordRef)}
            slotProps={{ htmlInput: { enterKeyHint: 'next' } }}
          />

          <TextField
            name="password"
            label="Password"
            variant="outlined"
            fullWidth
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
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            disabled={!password || !username}
            sx={{
              py: 1.2,
              fontWeight: 'bold',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            Log In
          </Button>

          {warning && (
            <Typography
              variant="body2"
              color="error"
              sx={{ textAlign: 'center', fontWeight: '500', mt: 1 }}
            >
              {warning}
            </Typography>
          )}
        </Stack>
      </form>
    </Box>
  );
};
