"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { FiSun, FiMoon } from "react-icons/fi";
import { motion } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const theme = useTheme();

  const handleSignup = async () => {
    if (!email || !password) {
      setError("All fields are required!");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: "asim" }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Account created! You can now log in.");
      router.push("/login");
    } else {
      setError("Signup failed! Try again.");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        bgcolor:
          theme.palette.mode === "light" ? "grey.50" : theme.palette.background.default,
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
              boxShadow: 3,
              position: "relative",
              textAlign: "center",
            }}
          >
            {/* 🌙 / ☀️ Theme Toggle */}
            <IconButton
              onClick={() =>
                theme.palette.mode === "light"
                  ? document.documentElement.setAttribute("data-theme", "dark")
                  : document.documentElement.removeAttribute("data-theme")
              }
              sx={{ position: "absolute", top: 16, right: 16 }}
            >
              {theme.palette.mode === "light" ? <FiMoon /> : <FiSun />}
            </IconButton>

            {/* 🏢 Logo */}
            <Image
              src="/logo.svg"
              alt="Logo"
              width={80}
              height={40}
              style={{ margin: "0 auto 16px" }}
            />

            {/* 📝 Heading */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Create your account
            </Typography>

            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              {error && (
                <Typography color="error" fontSize="0.9rem">
                  {error}
                </Typography>
              )}

              {/* 📨 Email Input */}
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                fullWidth
              />

              {/* 🔒 Password Input */}
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                fullWidth
              />

              <Button
                variant="outlined"
                onClick={handleSignup}
                disabled={loading}
                fullWidth
              >
                {loading ? "Creating..." : "Sign Up"}
              </Button>

              <Divider sx={{ my: 2 }} />

              {/* 🔗 Redirect to Login */}
              <Typography variant="body2" textAlign="center">
                Already have an account?{" "}
                <Button variant="text" onClick={() => router.push("/login")}>
                  Log in
                </Button>
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
