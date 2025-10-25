import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Link,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff, ChatBubble } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useThemeContext } from "../../context/ThemeContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { themeColors } = useThemeContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/chat");
    } catch (err: any) {
      // Handle Firebase-specific errors
      if (err.message.includes("auth/invalid-credential")) {
        setError("Invalid email or password");
      } else if (err.message.includes("auth/user-not-found")) {
        setError("No account found with this email");
      } else if (err.message.includes("auth/wrong-password")) {
        setError("Incorrect password");
      } else if (err.message.includes("auth/too-many-requests")) {
        setError("Too many failed attempts. Please try again later");
      } else if (err.message.includes("auth/network-request-failed")) {
        setError("Network error. Please check your connection");
      } else {
        setError("Failed to login. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
        padding: { xs: 2, sm: 3, md: 4, lg: 4 },
        overflow: "auto",
      }}
    >
      <Paper
        elevation={24}
        sx={{
          padding: {
            xs: 3,
            sm: 4,
            md: 5,
            lg: 6,
          },
          maxWidth: {
            xs: "100%",
            sm: 450,
            md: 480,
            lg: 500,
          },
          width: "100%",
          borderRadius: { xs: 2, sm: 3, md: 3 },
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
          my: { xs: 2, sm: 0 },
          mx: { xs: "auto" },
        }}
      >
        {/* Logo and Title */}
        <Box sx={{ textAlign: "center", mb: { xs: 2.5, sm: 3, md: 4 } }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: 50, sm: 60, md: 64, lg: 70 },
              height: { xs: 50, sm: 60, md: 64, lg: 70 },
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              mb: { xs: 1.5, sm: 2, md: 2 },
              boxShadow: `0 8px 24px ${themeColors.primary}40`,
            }}
          >
            <ChatBubble
              sx={{
                fontSize: { xs: 26, sm: 30, md: 32, lg: 36 },
                color: "white",
              }}
            />
          </Box>
          <Typography
            variant="h4"
            fontWeight="700"
            sx={{
              fontSize: {
                xs: "1.5rem",
                sm: "1.875rem",
                md: "2rem",
                lg: "2.125rem",
              },
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 0.5,
            }}
          >
            Welcome to Snappin
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.875rem", md: "0.9rem" },
              px: { xs: 2, sm: 0 },
            }}
          >
            Sign in to continue to your account
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: { xs: 2, sm: 3 },
              borderRadius: 2,
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            variant="outlined"
            autoComplete="email"
            disabled={loading}
            sx={{
              mb: { xs: 1.5, sm: 2, md: 2.5 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1rem" },
                "& input": {
                  padding: { xs: "14px", sm: "16.5px 14px", md: "16.5px 14px" },
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: themeColors.primary,
                  borderWidth: 2,
                },
              },
              "& .MuiInputLabel-root": {
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1rem" },
                "&.Mui-focused": {
                  color: themeColors.primary,
                },
              },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
            autoComplete="current-password"
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size={window.innerWidth < 600 ? "small" : "medium"}
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1rem" },
                "& input": {
                  padding: { xs: "14px", sm: "16.5px 14px", md: "16.5px 14px" },
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: themeColors.primary,
                  borderWidth: 2,
                },
              },
              "& .MuiInputLabel-root": {
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1rem" },
                "&.Mui-focused": {
                  color: themeColors.primary,
                },
              },
            }}
          />

          {/* Forgot Password Link */}
          <Box
            sx={{
              textAlign: "right",
              mb: { xs: 2.5, sm: 3, md: 3.5 },
            }}
          >
            <Link
              href="#"
              underline="hover"
              sx={{
                color: themeColors.primary,
                fontSize: { xs: "0.8rem", sm: "0.875rem", md: "0.9rem" },
                fontWeight: 500,
              }}
            >
              Forgot password?
            </Link>
          </Box>

          {/* Sign In Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              borderRadius: 2,
              py: { xs: 1.25, sm: 1.5, md: 1.75 },
              fontSize: { xs: "0.95rem", sm: "1rem", md: "1.05rem" },
              fontWeight: 600,
              textTransform: "none",
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              boxShadow: `0 4px 14px ${themeColors.primary}40`,
              "&:hover": {
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                boxShadow: `0 6px 20px ${themeColors.primary}60`,
                transform: "translateY(-2px)",
              },
              "&:active": {
                transform: "translateY(0px)",
              },
              "&:disabled": {
                background: `linear-gradient(135deg, ${themeColors.primary}80, ${themeColors.secondary}80)`,
              },
              transition: "all 0.3s ease",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Sign Up Link */}
        <Box
          sx={{
            textAlign: "center",
            mt: { xs: 2.5, sm: 3, md: 3.5 },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.875rem", sm: "0.9rem", md: "0.95rem" },
            }}
          >
            Don't have an account?{" "}
            <Link
              component="button"
              type="button"
              onClick={() => navigate("/signup")}
              underline="hover"
              disabled={loading}
              sx={{
                color: themeColors.primary,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
