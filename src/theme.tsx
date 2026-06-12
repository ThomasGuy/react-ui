import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// A custom theme for this app
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: {
      main: '#0094f6cc',
    },
    secondary: {
      main: '#a127d1e1',
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
