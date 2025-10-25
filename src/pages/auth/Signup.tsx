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

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { themeColors } = useThemeContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signup(name.trim(), email, password);
      navigate("/chat");
    } catch (err: any) {
      // Handle Firebase-specific errors
      if (err.message.includes("auth/email-already-in-use")) {
        setError("This email is already registered. Please login instead");
      } else if (err.message.includes("auth/invalid-email")) {
        setError("Invalid email address");
      } else if (err.message.includes("auth/weak-password")) {
        setError("Password is too weak. Please choose a stronger password");
      } else if (err.message.includes("auth/network-request-failed")) {
        setError("Network error. Please check your connection");
      } else if (err.message.includes("auth/operation-not-allowed")) {
        setError(
          "Email/password accounts are not enabled. Please contact support"
        );
      } else {
        setError("Failed to create account. Please try again");
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
            xs: 2.5,
            sm: 3.5,
            md: 4.5,
            lg: 5.5,
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
        <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3, md: 3.5 } }}>
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
            Join Snappin
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.875rem", md: "0.9rem" },
              px: { xs: 2, sm: 0 },
            }}
          >
            Create your account to get started
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: { xs: 1.5, sm: 2, md: 2.5 },
              borderRadius: 2,
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            variant="outlined"
            autoComplete="name"
            disabled={loading}
            sx={{
              mb: { xs: 1, sm: 1.5, md: 1.5 },
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
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            variant="outlined"
            autoComplete="email"
            disabled={loading}
            sx={{
              mb: { xs: 1, sm: 1.5, md: 1.5 },
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
            autoComplete="new-password"
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
              mb: { xs: 1, sm: 1.5, md: 1.5 },
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
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            variant="outlined"
            autoComplete="new-password"
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size={window.innerWidth < 600 ? "small" : "medium"}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: { xs: 2, sm: 2.5, md: 3 },
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

          {/* Sign Up Button */}
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
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        {/* Login Link */}
        <Box
          sx={{
            textAlign: "center",
            mt: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.875rem", sm: "0.9rem", md: "0.95rem" },
            }}
          >
            Already have an account?{" "}
            <Link
              component="button"
              type="button"
              onClick={() => navigate("/login")}
              underline="hover"
              disabled={loading}
              sx={{
                color: themeColors.primary,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>

        {/* Terms and Privacy */}
        <Box
          sx={{
            textAlign: "center",
            mt: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
              display: "block",
              px: { xs: 1, sm: 0 },
              lineHeight: { xs: 1.5, sm: 1.6 },
            }}
          >
            By signing up, you agree to our{" "}
            <Link
              href="#"
              sx={{
                color: themeColors.primary,
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              sx={{
                color: themeColors.primary,
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Privacy Policy
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Signup;
