import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

import '@mui/material/styles';

declare module '@mui/material/styles' {
  // 1. Extend the options object used during theme creation
  interface SimplePaletteColorOptions {
    second?: string;
  }

  // 2. Extend the actual theme palette object used at runtime
  interface PaletteColor {
    second?: string;
  }
}

// A custom theme for this app
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: {
      main: '#0094f6e4',
      second: '#2ace56cb',
    },
    secondary: {
      main: '#a127d1f0',
    },
    error: {
      main: red.A400,
    },
    info: {
      main: '#ccc',
      second: '#e055dee5',
    },
  },
});

export default theme;
