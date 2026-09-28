import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#315C8C",
    },

    secondary: {
      main: "#C88B3A",
    },

    success: {
      main: "#2F7D5C",
    },

    error: {
      main: "#C94F4F",
    },

    background: {
      default: "#F7F5F0",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#263238",
      secondary: "#687076",
    },
  },

  typography: {
    fontFamily: "Inter, Arial, sans-serif",

    h4: {
      fontWeight: 800,
      color: "#263238",
    },

    h5: {
      fontWeight: 750,
      color: "#263238",
    },

    h6: {
      fontWeight: 750,
      color: "#263238",
    },

    subtitle1: {
      fontWeight: 650,
      color: "#344054",
    },

    body1: {
      color: "#344054",
    },

    body2: {
      color: "#687076",
    },

    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },

  shape: {
    borderRadius: 10,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F7F5F0",
          color: "#263238",
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },

    MuiButton: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          fontWeight: 700,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid #E8E1D6",
          borderRadius: 10,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 7,
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: {
          color: "#263238",
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderRadius: 8,

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D9D1C5",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#B7A99A",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#315C8C",
            borderWidth: 1,
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#687076",
          fontWeight: 600,

          "&.Mui-focused": {
            color: "#315C8C",
          },
        },
      },
    },
  },
});

export default theme;
