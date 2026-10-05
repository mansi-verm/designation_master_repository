
import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";

import { login } from "../../../api/AuthApi";
import { setAuth } from "../../../auth/auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError("Username and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const result = await login({
        username: username.trim(),
        password,
      });

      setAuth(result.token, {
        userId: result.userId,
        username: result.username,
        role: result.role,
      });

      setSuccess("Login successful");

      window.location.href = "/designation";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background: "#F4F7FA",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          borderRadius: 3,
          border: "1px solid #D9E2EC",
          boxShadow: "0 12px 35px rgba(16,42,67,0.10)",
        }}
      >
        {/* Login Icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0B3A78",
              color: "#FFFFFF",
            }}
          >
            <LockOutlinedIcon />
          </Box>
        </Box>

        {/* Heading */}
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            fontWeight: 700,
            color: "#102A43",
          }}
        >
          Login
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "#64748B",
            mt: 0.5,
            mb: 3,
            fontSize: 14,
          }}
        >
          Sign in to Designation Master
        </Typography>

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Success */}
        {success && (
          <Alert
            severity="success"
            sx={{
              mb: 2,
              borderRadius: 2,
            }}
          >
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Username */}
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            disabled={loading}
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {/* Show Password */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: 0.5,
              mb: 1,
            }}
          >
            <input
              id="show-password"
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              disabled={loading}
              style={{
                width: 16,
                height: 16,
                cursor: loading ? "default" : "pointer",
                accentColor: "#0B3A78",
              }}
            />

            <Typography
              component="label"
              htmlFor="show-password"
              sx={{
                ml: 0.8,
                fontSize: 14,
                color: "#64748B",
                cursor: loading ? "default" : "pointer",
                userSelect: "none",
              }}
            >
              Show password
            </Typography>
          </Box>

          {/* Login Button */}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={!loading ? <LoginRoundedIcon /> : undefined}
            sx={{
              mt: 1.5,
              py: 1.25,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
              background: "#0B3A78",

              "&:hover": {
                background: "#082F63",
              },

              "&:disabled": {
                background: "#94A3B8",
                color: "#FFFFFF",
              },
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Login"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;