"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  useTheme,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InsightsIcon from "@mui/icons-material/Insights";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.mode === "light" ? "#f4f4f5" : "#0f0f0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          {/* --- Hero Text Section --- */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h3"
                fontWeight={800}
                lineHeight={1.2}
                color={theme.palette.mode === "light" ? "text.primary" : "#fff"}
                gutterBottom
              >
                MarkSync Attendance Portal
              </Typography>

              <Typography
                variant="h6"
                color={
                  theme.palette.mode === "light"
                    ? "text.secondary"
                    : "rgba(255,255,255,0.8)"
                }
                sx={{ mb: 3 }}
              >
                Streamline attendance with time and location verification —
                built for accuracy, fairness, and simplicity.
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                  }}
                  endIcon={<CheckCircleOutlineIcon />}
                  onClick={() => router.push("/login")}
                >
                  Sign In
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  sx={{
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderColor:
                      theme.palette.mode === "light"
                        ? "text.primary"
                        : "rgba(255,255,255,0.6)",
                    color:
                      theme.palette.mode === "light" ? "text.primary" : "#fff",
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "light"
                          ? "#f0f0f0"
                          : "rgba(255,255,255,0.1)",
                    },
                    textTransform: "none",
                  }}
                  onClick={() => router.push("/about")}
                >
                  Learn More
                </Button>
              </Stack>
            </motion.div>
          </Grid>

          {/* --- Hero Card Section --- */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Paper
                elevation={theme.palette.mode === "light" ? 3 : 6}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? "#fff"
                      : "rgba(255,255,255,0.05)",
                }}
              >
                <Stack alignItems="center" spacing={2}>
                  <SchoolIcon
                    sx={{
                      fontSize: 60,
                      color: theme.palette.primary.main,
                    }}
                  />
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    textAlign="center"
                    gutterBottom
                  >
                    Smart & Secure Attendance System
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    textAlign="center"
                  >
                    Simplify student attendance with real-time verification,
                    time-bound sessions, and exportable reports.
                  </Typography>
                </Stack>

                <Grid container spacing={3} sx={{ mt: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <FeatureCard
                      icon={<AccessTimeIcon color="primary" />}
                      title="Time Verification"
                      desc="Attendance allowed only during class hours."
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FeatureCard
                      icon={<LocationOnIcon color="primary" />}
                      title="Geo Validation"
                      desc="Mark attendance from verified coordinates only."
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FeatureCard
                      icon={<InsightsIcon color="primary" />}
                      title="Reports"
                      desc="Download detailed attendance analytics."
                    />
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* --- Footer --- */}
        <Box textAlign="center" mt={8}>
          <Typography
            variant="body2"
            color={
              theme.palette.mode === "light"
                ? "text.secondary"
                : "rgba(255,255,255,0.6)"
            }
          >
            © {new Date().getFullYear()} Smart Attendance System — Developed by
            Asim Ali Murtaza 🎓
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Stack spacing={1.5} alignItems="center" textAlign="center">
      {icon}
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {desc}
      </Typography>
    </Stack>
  );
}
