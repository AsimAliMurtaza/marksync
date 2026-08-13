"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Stack,
  CircularProgress,
  Paper,
  Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/redirect",
    });
    setLoading(false);

    if (res?.error) {
      toast.error("Invalid email or password");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3.5, sm: 4.5 },
            borderRadius: "20px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          <Stack spacing={3}>
            <Box textAlign="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  bgcolor: "#EEF2FF",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5,
                }}
              >
                <SchoolOutlinedIcon sx={{ fontSize: 26, color: "#6366F1" }} />
              </Box>
              <Typography variant="h5" fontWeight={800} color="#0F172A">
                Welcome to MarkSync
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Sign in to access your portal
              </Typography>
            </Box>

            {/* Email */}
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#334155", mb: 0.75 }}>
                Email Address
              </FormLabel>
              <TextField
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="medium"
                fullWidth
              />
            </FormControl>

            {/* Password */}
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#334155", mb: 0.75 }}>
                Password
              </FormLabel>
              <TextField
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="medium"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </FormControl>

            <Button
              onClick={handleLogin}
              variant="contained"
              fullWidth
              size="large"
              sx={{
                py: 1.3,
                fontSize: "0.95rem",
                borderRadius: "10px",
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Sign In"}
            </Button>

            <Box textAlign="center" pt={1}>
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{" "}
                <Link
                  component="button"
                  underline="hover"
                  fontWeight={700}
                  color="#6366F1"
                  onClick={() => router.push("/signup")}
                >
                  Create Account
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
