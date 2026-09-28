import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderTop: "1px solid #E8E1D6",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 -2px 10px rgba(38, 50, 56, 0.05)",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "#687076",
          fontWeight: 500,
        }}
      >
        © 2026 Organization. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
