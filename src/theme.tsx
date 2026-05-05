import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

// A custom theme for this app
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: {
      main: "#0095f6",
    },
    secondary: {
      main: "#ed4956",
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
