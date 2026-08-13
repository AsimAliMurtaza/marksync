"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Paper,
  Stack,
  Link,
  CircularProgress,
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import toast from "react-hot-toast";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "STUDENT" }),
      });

      const result = await res.json();
      setLoading(false);

      if (res.ok && result.success) {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      } else {
        setError(result.error || "Signup failed! Please try again.");
      }
    } catch {
      setLoading(false);
      setError("Network error occurred during sign up.");
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
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Register to track your course attendance
              </Typography>
            </Box>

            {error && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "10px",
                  bgcolor: "#FFF1F2",
                  border: "1px solid #FFE4E6",
                  color: "#E11D48",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {error}
              </Box>
            )}

            {/* Name */}
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#334155", mb: 0.75 }}>
                Full Name
              </FormLabel>
              <TextField
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="medium"
                fullWidth
              />
            </FormControl>

            {/* Email */}
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#334155", mb: 0.75 }}>
                Email Address
              </FormLabel>
              <TextField
                type="email"
                placeholder="student@university.edu"
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
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="medium"
                fullWidth
              />
            </FormControl>

            <Button
              onClick={handleSignup}
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
              {loading ? <CircularProgress size={22} color="inherit" /> : "Create Account"}
            </Button>

            <Box textAlign="center" pt={1}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link
                  component="button"
                  underline="hover"
                  fontWeight={700}
                  color="#6366F1"
                  onClick={() => router.push("/login")}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
