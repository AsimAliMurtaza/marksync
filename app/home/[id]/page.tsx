"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Paper,
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Fade,
  Container,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import MyLocationOutlinedIcon from "@mui/icons-material/MyLocationOutlined";

interface CourseDetail {
  _id: string;
  id: number;
  name: string;
  code: string;
  allowedRadius: number;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
}

function getDeviceInfo(): string {
  if (typeof window === "undefined") return "";
  return [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    navigator.platform,
  ].join("|");
}

export default function ClassDetailPage(): JSX.Element {
  const [classData, setClassData] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [markingAttendance, setMarkingAttendance] = useState<boolean>(false);
  const [isPresent, setIsPresent] = useState<boolean | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  useEffect(() => {
    const loadClassData = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/classes/${classId}`);
        const result = await response.json();
        if (result.success && result.data) {
          setClassData(result.data as CourseDetail);
        } else {
          throw new Error(result.error || "Failed to fetch class details");
        }
      } catch (error) {
        console.error(error);
        setSnackbar({
          open: true,
          message: "Failed to load class details. Please try again.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    if (classId) void loadClassData();
  }, [classId]);

  useEffect(() => {
    const checkAttendanceStatus = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/attendance/status?classId=${classId}`);
        const result = await response.json();
        setIsPresent(result.success ? result.data?.isPresent ?? false : false);
      } catch (error) {
        console.error(error);
        setIsPresent(false);
      }
    };
    if (classId) void checkAttendanceStatus();
  }, [classId]);

  const handleMarkPresent = async (): Promise<void> => {
    if (!classData) return;

    if (!navigator.geolocation) {
      setSnackbar({
        open: true,
        message: "Geolocation is not supported by this browser.",
        severity: "error",
      });
      return;
    }

    setMarkingAttendance(true);

    navigator.geolocation.getCurrentPosition(
      async (position: GeolocationPosition) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch("/api/attendance/mark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              class: classData.id,
              userLat: latitude,
              userLon: longitude,
              deviceInfo: getDeviceInfo(),
            }),
          });

          const result = await response.json();

          if (result.success) {
            setSnackbar({
              open: true,
              message: result.message ?? "Attendance marked successfully!",
              severity: "success",
            });
            setIsPresent(true);
          } else {
            setSnackbar({
              open: true,
              message: result.error ?? "Failed to mark attendance",
              severity: "error",
            });
          }
        } catch (error) {
          console.error(error);
          setSnackbar({
            open: true,
            message: "Error marking attendance",
            severity: "error",
          });
        } finally {
          setMarkingAttendance(false);
        }
      },
      (error: GeolocationPositionError) => {
        console.error(error);
        setSnackbar({
          open: true,
          message: "Unable to get location. Please enable location permissions.",
          severity: "error",
        });
        setMarkingAttendance(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh" bgcolor="#F8FAFC">
        <CircularProgress color="primary" />
      </Box>
    );

  if (!classData)
    return (
      <Box textAlign="center" py={10} bgcolor="#F8FAFC" minHeight="100vh">
        <Typography variant="h5" color="error">
          Course not found
        </Typography>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => router.push("/home")}>
          Back to Dashboard
        </Button>
      </Box>
    );

  return (
    <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: { xs: 3, md: 5 }, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <Container maxWidth="md" disableGutters>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: "20px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Header */}
          <Box display="flex" alignItems="center" mb={3} gap={2}>
            <IconButton onClick={() => router.push("/home")} sx={{ border: "1px solid #E2E8F0" }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box flexGrow={1}>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                {classData.name}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                Course Code: {classData.code}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Schedule & Location Info */}
          <Box sx={{ display: "grid", gap: 2, mb: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5} sx={{ p: 2, borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #F1F5F9" }}>
              <AccessTimeOutlinedIcon sx={{ color: "#6366F1" }} />
              <Typography variant="body1" fontWeight={600} color="#1E293B">
                Schedule: {classData.schedule.dayOfWeek} ({classData.schedule.startTime} - {classData.schedule.endTime})
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1.5} sx={{ p: 2, borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #F1F5F9" }}>
              <LocationOnOutlinedIcon sx={{ color: "#14B8A6" }} />
              <Typography variant="body1" color="#1E293B">
                Room: <strong>{classData.schedule.room || "TBA"}</strong> | Geofence Radius:{" "}
                <strong>{classData.allowedRadius ?? 30} meters</strong>
              </Typography>
            </Box>
          </Box>

          {/* Status Chip */}
          <Box mb={4} textAlign="center">
            <Fade in={isPresent !== null}>
              <Box>
                {isPresent === null ? (
                  <Chip
                    icon={<HourglassEmptyOutlinedIcon />}
                    label="Checking attendance status..."
                    sx={{ bgcolor: "#EFF6FF", color: "#3B82F6", fontWeight: 700, py: 2, px: 2 }}
                  />
                ) : isPresent ? (
                  <Chip
                    icon={<CheckCircleOutlinedIcon style={{ color: "#059669" }} />}
                    label="ATTENDANCE MARKED PRESENT"
                    sx={{
                      bgcolor: "#ECFDF5",
                      color: "#059669",
                      border: "1px solid #A7F3D0",
                      py: 2.5,
                      px: 3,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                    }}
                  />
                ) : (
                  <Chip
                    icon={<CancelOutlinedIcon style={{ color: "#D97706" }} />}
                    label="ATTENDANCE NOT MARKED YET"
                    sx={{
                      bgcolor: "#FFFBEB",
                      color: "#D97706",
                      border: "1px solid #FDE68A",
                      py: 2.5,
                      px: 3,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>
            </Fade>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Action Button */}
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Button
              variant="contained"
              size="large"
              onClick={handleMarkPresent}
              disabled={markingAttendance || !!isPresent}
              startIcon={<MyLocationOutlinedIcon />}
              sx={{
                px: 5,
                py: 1.5,
                fontSize: "1rem",
                borderRadius: "12px",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {isPresent
                ? "Attendance Already Verified"
                : markingAttendance
                ? "Verifying GPS Location..."
                : "Verify Location & Mark Present"}
            </Button>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Ensure you are physically present inside room {classData.schedule.room} with location services enabled.
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%", borderRadius: "10px" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}