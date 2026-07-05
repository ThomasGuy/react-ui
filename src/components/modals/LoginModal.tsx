import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { VisibilityOff, Visibility } from '@mui/icons-material';

import { ILoginResponse, IModalLoginProps } from '@/utils/types';
import { useAuth } from '@/context/AuthContext';
import { style } from './modal_style';

export const LoginModal = ({ open, onClose, signUp }: IModalLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [warning, setWarning] = useState('');
  const { authFetch, login } = useAuth();

  const passwordRef = useRef<HTMLInputElement>(null);

  const handleCancelAndClear = () => {
    setUsername('');
    setPassword('');
    setWarning('');
    onClose();
  };

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
        setUsername('');
        setPassword('');
        setWarning('Incorrect username and/or password');
      } else if (response.ok) {
        const newLoginData = (await response.json()) as ILoginResponse;
        login(newLoginData);
        handleCancelAndClear();
      }
    } catch (error) {
      console.error('Fetch error: ', error);
    }
  };

  const handleSignup = () => {
    handleCancelAndClear();
    signUp(true);
  };

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

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        handleCancelAndClear();
      }}
      sx={style}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleLogin,
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
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

        <Stack spacing={2.5}>
          <TextField
            name="username"
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(evt) => setUsername(evt.target.value)}
            autoComplete="username"
            slotProps={{
              htmlInput: {
                enterKeyHint: 'next',
                onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) =>
                  handleKeyDown(e, passwordRef),
              },
            }}
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
      </DialogContent>

      {/* 🚀 Sticky Modal Bottom Action Footers */}
      <DialogActions
        sx={{
          px: { xs: 1, sm: 3 },
          pb: 3,
          gap: 1.5,
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
        }}
      >
        <Button
          variant="text"
          color="inherit"
          type="button" // ◄ Explictly typed as normal button
          onClick={handleCancelAndClear}
          sx={{ gridColumn: 'span 6', py: 1.2, fontWeight: 'bold' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit" // ◄ Automatically fires the slotProps.paper's onSubmit handler
          disabled={!password || !username}
          sx={{
            gridColumn: 'span 6',
            py: 1.2,
            fontWeight: 'bold',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          Login
        </Button>
        <Button
          variant="text"
          type="button"
          onClick={handleSignup}
          sx={{ color: 'primary', gridColumn: 'span 12', mt: 1, fontWeight: 500 }}
        >
          or signup
        </Button>
      </DialogActions>
    </Dialog>
  );
};
