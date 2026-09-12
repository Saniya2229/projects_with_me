import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
  palette: {
    primary: {
      main: "#FF6F61",
    },
    secondary: {
      main: "#37474F",
    },
    background: {
      default: "#fff8f0",
    },
  },
});

export default theme;
