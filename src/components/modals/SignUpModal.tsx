import React, { useState, useRef } from 'react';
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

import { useAuth } from '@/context/AuthContext';
import { VisibilityOff, Visibility } from '@mui/icons-material';
import { style } from './modal_style';
import { ModalProps } from '@/utils/types';

export const SignUpModal = ({ open, onClose }: ModalProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [warning, setWarning] = useState('');
  const { authFetch } = useAuth();

  // 1. Create focus references for the input elements
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleCancelAndClear = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setWarning('');
    onClose();
  };

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
        method: 'POST',
        body: json_string,
      };

      const response = await authFetch('/user/signup', requestOptions);

      if (response.status === 409) {
        setEmail('');
        setUsername('');
        setWarning('Username and/or email already taken');
      } else if (!response.ok) {
        throw new Error('Register user failed');
      } else if (response.ok) {
        onClose();
      }
    } catch (error) {
      console.error('Fetch error: ', error);
      alert(error);
    }
  };

  // 2. Intercept Enter key to shift focus instead of submitting early
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
          onSubmit: handleSignUp,
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
            Sign Up
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
                onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => handleKeyDown(e, emailRef),
              },
            }}
          />
          <TextField
            name="email"
            label="Email Address"
            variant="outlined"
            fullWidth
            type="email"
            value={email}
            onChange={(evt) => setEmail(evt.target.value)}
            autoComplete="email"
            inputRef={emailRef}
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
            autoComplete="new-password"
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
      <DialogActions sx={{ px: { xs: 1, sm: 3 }, pb: 3, gap: 1.5 }}>
        <Button
          variant="text"
          color="inherit"
          type="button" // ◄ Explictly typed as normal button
          onClick={handleCancelAndClear}
          sx={{ width: '50%', py: 1.2, fontWeight: 'bold' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit" // ◄ Automatically fires the slotProps.paper's onSubmit handler
          disabled={!password || !username || !email}
          sx={{
            width: '50%',
            py: 1.2,
            fontWeight: 'bold',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          Create Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};
