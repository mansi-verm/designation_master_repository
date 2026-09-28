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

import { login } from "../../../api/AuthApi";
import { setAuth } from "../../../auth/auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

      // After successful login, open Activity Board
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
        background: "linear-gradient(135deg, #F4F7FA 0%, #E8EEF5 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
          border: "1px solid #D7E0E8",
          boxShadow: "0 18px 50px rgba(16,42,67,0.12)",
        }}
      >
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
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #0B3A78, #163A5F)",
              color: "white",
            }}
          >
            <LockOutlinedIcon />
          </Box>
        </Box>

        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            fontWeight: 800,
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
          }}
        >
          Sign in to Designation Master
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            autoComplete="username"
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            autoComplete="current-password"
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.25,
              borderRadius: 2,
              fontWeight: 800,
              textTransform: "none",
              background: "linear-gradient(135deg, #0B3A78, #163A5F)",
              "&:hover": {
                background: "linear-gradient(135deg, #082F63, #12324F)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
