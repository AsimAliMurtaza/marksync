"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          {/* --- Hero Text Section --- */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box
                sx={{
                  display: "inline-block",
                  px: 2,
                  py: 0.75,
                  mb: 3,
                  borderRadius: "20px",
                  bgcolor: "#EEF2FF",
                  border: "1px solid #E0E7FF",
                }}
              >
                <Typography variant="caption" fontWeight={700} color="#4F46E5">
                  Location & Time Verified Attendance
                </Typography>
              </Box>

              <Typography
                variant="h2"
                fontWeight={800}
                sx={{
                  fontSize: { xs: "2.25rem", sm: "3rem", md: "3.25rem" },
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  color: "#0F172A",
                  mb: 2,
                }}
              >
                Smart Attendance Management for Universities
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontSize: "1.1rem",
                  lineHeight: 1.6,
                  mb: 4,
                  maxWidth: 520,
                }}
              >
                Streamline course attendance with high-precision geolocation and session time verification. Designed for students, course instructors, and academic administrators.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push("/login")}
                  endIcon={<ArrowForwardOutlinedIcon />}
                  sx={{
                    px: 3.5,
                    py: 1.4,
                    fontSize: "0.95rem",
                    borderRadius: "10px",
                  }}
                >
                  Sign In to Portal
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push("/signup")}
                  sx={{
                    px: 3.5,
                    py: 1.4,
                    fontSize: "0.95rem",
                    borderRadius: "10px",
                    borderColor: "#CBD5E1",
                    color: "#334155",
                    "&:hover": {
                      borderColor: "#94A3B8",
                      bgcolor: "#F1F5F9",
                    },
                  }}
                >
                  Create Student Account
                </Button>
              </Stack>
            </motion.div>
          </Grid>

          {/* --- Hero Card Section --- */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: "20px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.02)",
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "14px",
                      bgcolor: "#EEF2FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SchoolOutlinedIcon sx={{ fontSize: 28, color: "#6366F1" }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="#0F172A">
                      MarkSync Platform
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comprehensive Attendance Tracking
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  <FeatureItem
                    icon={<AccessTimeOutlinedIcon sx={{ color: "#6366F1" }} />}
                    title="Time-Bounded Sessions"
                    desc="Students can only check in during scheduled course hours."
                  />
                  <FeatureItem
                    icon={<LocationOnOutlinedIcon sx={{ color: "#14B8A6" }} />}
                    title="GPS Distance Validation"
                    desc="Haversine geodesic verification ensures presence inside the classroom."
                  />
                  <FeatureItem
                    icon={<AssessmentOutlinedIcon sx={{ color: "#8B5CF6" }} />}
                    title="Excel Analytics & Reports"
                    desc="Instructors & admins export custom Excel reports instantly."
                  />
                </Stack>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* --- Footer --- */}
        <Box textAlign="center" mt={{ xs: 8, md: 10 }}>
          <Typography variant="body2" color="text.secondary">
            MarkSync Attendance System — Developed by Asim Ali Murtaza
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "12px",
        bgcolor: "#F8FAFC",
        border: "1px solid #F1F5F9",
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
      }}
    >
      <Box
        sx={{
          p: 1,
          borderRadius: "8px",
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          display: "flex",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle2" fontWeight={700} color="#1E293B">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem", mt: 0.25 }}>
          {desc}
        </Typography>
      </Box>
    </Box>
  );
}
