"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { motion } from "framer-motion";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

interface EnrolledCourse {
  id: number;
  title: string;
  code: string;
  room: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  semester?: { name: string };
  instructor?: { name: string; email: string };
}

export default function StudentDashboard() {
  const [classes, setClasses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/classes");
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setClasses(result.data);
        } else {
          setClasses([]);
        }
      } catch {
        setSnackbar({
          open: true,
          message: "Unable to load courses. Please try again.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const todayName = new Date().toLocaleString("en-US", { weekday: "long" });

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 4,
          background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
          color: "#0F172A",
          borderRadius: "20px",
          border: "1px solid #C7D2FE",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              bgcolor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SchoolOutlinedIcon sx={{ fontSize: 24, color: "#4F46E5" }} />
          </Box>
          <Typography variant="h4" fontWeight={800} color="#1E1B4B">
            Student Workspace
          </Typography>
        </Box>
        <Typography variant="body1" color="#3730A3" sx={{ opacity: 0.9 }}>
          Today is <strong>{todayName}</strong>. You are enrolled in{" "}
          <strong>{classes.length}</strong> course{classes.length !== 1 ? "s" : ""}.
        </Typography>
      </Paper>

      {/* Loading */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "40vh",
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
            flexDirection={{ xs: "column", sm: "row" }}
            gap={2}
          >
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              Enrolled Courses
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push("/home/register-courses")}
              sx={{ borderRadius: "10px", width: { xs: "100%", sm: "auto" } }}
            >
              Register New Courses
            </Button>
          </Box>

          {/* Classes Grid */}
          <Grid container spacing={3}>
            {classes.map((c) => {
              const isTodayClass =
                c.dayOfWeek &&
                c.dayOfWeek.toLowerCase() === todayName.toLowerCase();

              return (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <Card
                      onClick={() => router.push(`/home/${c.id}`)}
                      elevation={0}
                      sx={{
                        borderRadius: "16px",
                        cursor: "pointer",
                        height: "100%",
                        bgcolor: "#FFFFFF",
                        border: "1px solid",
                        borderColor: isTodayClass ? "#818CF8" : "#E2E8F0",
                        boxShadow: isTodayClass
                          ? "0 4px 14px rgba(99, 102, 241, 0.1)"
                          : "0 1px 3px rgba(0, 0, 0, 0.04)",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          boxShadow: "0 10px 25px rgba(99, 102, 241, 0.12)",
                          borderColor: "#6366F1",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                          <Typography variant="h6" fontWeight={700} color="#1E293B" noWrap sx={{ maxWidth: "70%" }}>
                            {c.title}
                          </Typography>
                          <Chip
                            label={c.code}
                            size="small"
                            sx={{
                              bgcolor: "#EEF2FF",
                              color: "#4F46E5",
                              fontWeight: 700,
                              border: "1px solid #E0E7FF",
                            }}
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" fontWeight={500} mb={2}>
                          {c.semester?.name || "Academic Semester"}
                        </Typography>

                        {c.instructor?.name && (
                          <Box display="flex" alignItems="center" gap={1} mb={1} color="text.secondary">
                            <PersonOutlinedIcon fontSize="small" sx={{ color: "#64748B" }} />
                            <Typography variant="body2">{c.instructor.name}</Typography>
                          </Box>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Box display="flex" alignItems="center" gap={1} mb={1} color="text.secondary">
                          <AccessTimeOutlinedIcon fontSize="small" sx={{ color: "#64748B" }} />
                          <Typography variant="body2" fontWeight={600} color="#334155">
                            {c.dayOfWeek}: {c.startTime} - {c.endTime}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={2.5} color="text.secondary">
                          <RoomOutlinedIcon fontSize="small" sx={{ color: "#64748B" }} />
                          <Typography variant="body2">Room: {c.room || "TBA"}</Typography>
                        </Box>

                        {isTodayClass ? (
                          <Chip
                            label="Class Scheduled Today"
                            size="small"
                            sx={{
                              bgcolor: "#ECFDF5",
                              color: "#059669",
                              fontWeight: 700,
                              width: "100%",
                              border: "1px solid #A7F3D0",
                            }}
                          />
                        ) : (
                          <Chip
                            label={`Scheduled on ${c.dayOfWeek}`}
                            variant="outlined"
                            size="small"
                            sx={{
                              color: "#64748B",
                              borderColor: "#E2E8F0",
                              fontWeight: 600,
                              width: "100%",
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          {/* Empty State */}
          {classes.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                mt: 4,
                textAlign: "center",
                p: 6,
                borderRadius: "20px",
                bgcolor: "#FFFFFF",
                border: "1px dashed #CBD5E1",
              }}
            >
              <Typography variant="h6" color="#1E293B" fontWeight={700}>
                No Courses Registered Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                You have not registered for any active courses in the system.
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 3, borderRadius: "10px", px: 4 }}
                onClick={() => router.push("/home/register-courses")}
              >
                Browse & Register Courses
              </Button>
            </Paper>
          )}
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
