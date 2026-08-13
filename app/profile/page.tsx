"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Container,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type ProfileData = {
  name: string;
  email: string;
  gender?: string | null;
  role?: string | null;
};

export default function ProfilePage(): JSX.Element {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<ProfileData>({
    name: "",
    email: "",
    gender: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();

        if (!data.success) throw new Error(data.error);

        setProfile(data.data);
        setForm({
          name: data.data.name || "",
          email: data.data.email || "",
          gender: data.data.gender || "",
          role: data.data.role || "",
        });
      } catch {
        setSnackbar({
          open: true,
          message: "Failed to load profile",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (): Promise<void> => {
    try {
      setSaving(true);

      const res = await fetch("/api/user/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error);

      setSnackbar({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });

      setProfile(form);
    } catch (err) {
      setSnackbar({
        open: true,
        message: (err as Error).message || "Update failed",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#F8FAFC">
        <CircularProgress />
      </Box>
    );

  if (!profile)
    return (
      <Box textAlign="center" py={10} bgcolor="#F8FAFC" minHeight="100vh">
        <Typography color="error">Profile not found</Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F8FAFC",
        px: { xs: 2, sm: 4 },
        py: { xs: 4, sm: 6 },
      }}
    >
      <Container maxWidth="sm" disableGutters>
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <IconButton onClick={() => router.back()} sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Account Profile
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: "20px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          <Typography variant="h5" fontWeight={800} color="#0F172A">
            Personal Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
            Manage your personal profile details and settings
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <TextField
            fullWidth
            name="name"
            label="Full Name"
            value={form.name}
            onChange={handleChange}
            sx={{ mb: 2.5 }}
          />

          <TextField
            fullWidth
            name="email"
            label="Email Address"
            value={form.email}
            disabled
            helperText="Email cannot be changed"
            sx={{ mb: 2.5 }}
          />

          <TextField
            fullWidth
            name="gender"
            label="Gender"
            value={form.gender || ""}
            onChange={handleChange}
            placeholder="Male / Female / Prefer not to say"
            sx={{ mb: 2.5 }}
          />

          <TextField
            fullWidth
            name="role"
            label="System Role"
            value={form.role || ""}
            disabled
            sx={{ mb: 4 }}
          />

          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={saving}
            onClick={handleSave}
            sx={{ py: 1.3, borderRadius: "10px", fontSize: "0.95rem" }}
          >
            {saving ? <CircularProgress size={22} color="inherit" /> : "Save Changes"}
          </Button>
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
