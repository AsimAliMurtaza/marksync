"use client";

import * as React from "react";
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

interface ClassData {
  _id: string;
  name: string;
  code: string;
  schedule?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
  };
  status?: "On Time" | "Cancelled" | "Rescheduled";
  location?: { latitude: number; longitude: number };
  allowedRadius?: number;
}

interface ApiResponse {
  success: boolean;
  data: ClassData[];
  error?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

// Time formatting
const formatTime = (time: string): string => {
  if (!time) return "TBA";
  try {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes || "00"} ${ampm}`;
  } catch {
    return "TBA";
  }
};

// Schedule formatting
const formatSchedule = (classItem: ClassData): string => {
  if (!classItem.schedule) return "No schedule";
  const { dayOfWeek, startTime, endTime } = classItem.schedule;
  return `${dayOfWeek.slice(0, 3)} ${formatTime(startTime)} - ${formatTime(
    endTime
  )}`;
};

export default function Home() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/classes");
        const result: ApiResponse = await res.json();
        if (!result.success) throw new Error(result.error);
        setClasses(result.data);
      } catch {
        setSnackbar({
          open: true,
          message: "Unable to load classes. Please try again.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleClassClick = (id: string) => router.push(`/classes/${id}`);

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const getStatusChip = (status: ClassData["status"]) => {
    if (!status) return null;
    const color =
      status === "On Time"
        ? "success"
        : status === "Cancelled"
        ? "error"
        : "warning";
    return (
      <Chip
        label={status}
        color={color}
        sx={{
          mt: 1,
          fontWeight: 500,
          borderRadius: 0,
          textTransform: "uppercase",
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: { xs: 1, sm: 2, md: 3 },
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          textAlign: "left",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 0,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
          BS-CS Fall 2025 Classes
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {loading
            ? "Loading classes..."
            : `${classes.length} ongoing class${
                classes.length !== 1 ? "es" : ""
              } available`}
        </Typography>
      </Paper>

      {/* Loading Indicator */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
          {/* Classes Grid */}
          <Grid container spacing={3}>
            {classes.map((classItem) => (
              <Grid item xs={12} sm={6} md={4} key={classItem._id}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card
                    onClick={() => handleClassClick(classItem._id)}
                    elevation={3}
                    sx={{
                      borderRadius: 0,
                      cursor: "pointer",
                      height: "100%",
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color="primary"
                        gutterBottom
                        noWrap
                      >
                        {classItem.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Code: {classItem.code}
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />

                      <Typography variant="body2" color="text.secondary">
                        {formatSchedule(classItem)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Room: {classItem.schedule?.room || "TBA"}
                      </Typography>

                      {getStatusChip(classItem.status)}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {classes.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                mt: 6,
                textAlign: "center",
                p: 6,
                borderRadius: 0,
                bgcolor: "background.paper",
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                No Classes Available
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                It seems there are no classes scheduled yet.
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 3, borderRadius: 0, px: 4 }}
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            </Paper>
          )}
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 0 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
