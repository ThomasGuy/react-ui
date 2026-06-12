import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { style } from './modal_style';
import { ISuccess } from '../types';
import { useAuth } from '../../context/AuthContext';
import { VisibilityOff, Visibility } from '@mui/icons-material';

export const SignUp = ({ onSuccess }: ISuccess) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [warning, setWarning] = useState('');
  const { authFetch } = useAuth();

  // 1. Create focus references for the input elements
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

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

      if (response.status == 409) {
        setEmail('');
        setUsername('');
        setWarning('username and/or email already taken');
      } else if (!response.ok) {
        throw new Error('register user failed');
      } else if (response.ok) {
        onSuccess();
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
      evt.preventDefault(); // Stop the form from submitting early
      nextRef.current?.focus(); // Hop cursor to the next field
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
        <Typography id="modal-signup-title" variant="h5" sx={{ flexGrow: 1, textAlign: 'center' }}>
          New user
        </Typography>
        <Box sx={{ width: { xs: 0, sm: '30px' } }} />
      </Stack>

      <form onSubmit={handleSignUp}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            name="username"
            placeholder="username"
            type="text"
            value={username}
            onChange={(evt) => setUsername(evt.target.value)}
            autoComplete="username" // Helps password managers autofill
            onKeyDown={(e) => handleKeyDown(e, emailRef)} // Focuses email on Enter
            slotProps={{ htmlInput: { enterKeyHint: 'next' } }}
          />
          <TextField
            name="email"
            placeholder="email"
            type="email"
            value={email}
            onChange={(evt) => setEmail(evt.target.value)}
            autoComplete="email"
            // Pass the inputRef so emailRef points directly to the native input element
            inputRef={emailRef}
            onKeyDown={(e) => handleKeyDown(e, passwordRef)} // Focuses password on Enter
            slotProps={{ htmlInput: { enterKeyHint: 'next' } }}
          />
          <TextField
            name="password"
            placeholder="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(evt) => setPassword(evt.target.value)}
            autoComplete="new-password"
            inputRef={passwordRef}
            slotProps={{
              htmlInput: { enterKeyHint: 'done' },
              // 3. Inject the interactive eye icon into the trailing side of the input box
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      onMouseDown={(e) => e.preventDefault()} // Prevents field from losing focus on click
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
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
