"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface ClassData {
  _id: string;
  name: string;
  code: string;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  allowedRadius?: number;
  cr?: {
    name: string;
    email: string;
  };
  status?: "On Time" | "Cancelled" | "Rescheduled";
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse {
  success: boolean;
  data: ClassData;
  error?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

// Format time from 24h to 12h format
const formatTime = (time: string): string => {
  if (!time) return "TBA";

  try {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes || "00"} ${ampm}`;
  } catch {
    return time;
  }
};

// Format schedule for display
const formatSchedule = (schedule: ClassData["schedule"]): string => {
  if (!schedule?.dayOfWeek) return "Schedule not available";

  const dayAbbreviation = schedule.dayOfWeek.substring(0, 3);
  const startTime = formatTime(schedule.startTime);
  const endTime = formatTime(schedule.endTime);
  return `${dayAbbreviation} ${startTime} - ${endTime}`;
};

const fetchClassDetails = async (id: string): Promise<ClassData> => {
  try {
    const response = await fetch(`/api/classes/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch class details");
    }

    if (!result.data) {
      throw new Error("No class data received");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching class details:", error);
    throw error;
  }
};

export default function ClassDetailPage() {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [markingAttendance, setMarkingAttendance] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const router = useRouter();
  const { id } = useParams();
  const classId = id as string;

  // Use a real user ID - replace this with an actual user ID from your database
  const studentId = "657a1b8c9d8f4a2b3c5d6e8a"; // Make sure this is a valid ObjectId

  useEffect(() => {
    const loadClassData = async () => {
      try {
        const data = await fetchClassDetails(classId);
        setClassData(data);
      } catch (error) {
        console.error("Failed to fetch class details:", error);
        setSnackbar({
          open: true,
          message:
            "Failed to load class details. Please check if the class exists.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      loadClassData();
    } else {
      setLoading(false);
      setSnackbar({
        open: true,
        message: "No class ID provided",
        severity: "error",
      });
    }
  }, [classId]);

  const handleBackToDashboard = () => {
    router.push("/");
  };

  const handleMarkPresent = async () => {
    if (!classData) return;

    // Get user's current location
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
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          console.log("Sending attendance request with:", {
            student: studentId,
            class: classData._id,
            userLat: latitude,
            userLon: longitude,
          });

          const response = await fetch("/api/attendance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              student: studentId, // Use the actual studentId variable
              class: classData._id,
              userLat: latitude,
              userLon: longitude,
            }),
          });

          const result = await response.json();

          if (result.success) {
            setSnackbar({
              open: true,
              message: result.message || "Attendance marked successfully!",
              severity: "success",
            });
          } else {
            setSnackbar({
              open: true,
              message: result.error || "Failed to mark attendance",
              severity: "error",
            });
          }
        } catch (error) {
          console.error("Error marking attendance:", error);
          setSnackbar({
            open: true,
            message: "Failed to mark attendance",
            severity: "error",
          });
        } finally {
          setMarkingAttendance(false);
        }
      },
      (error: GeolocationPositionError) => {
        console.error("Error getting location:", error);
        let errorMessage = "Failed to get your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
        setMarkingAttendance(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getStatusChip = (status: ClassData["status"]) => {
    if (!status) return null;

    let color: "success" | "error" | "warning" | "default" = "default";

    switch (status) {
      case "On Time":
        color = "success";
        break;
      case "Cancelled":
        color = "error";
        break;
      case "Rescheduled":
        color = "warning";
        break;
      default:
        color = "default";
    }

    return <Chip label={status} color={color} sx={{ mt: 1 }} />;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          padding: 3,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!classData) {
    return (
      <Box sx={{ padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
          <Typography variant="h4" color="error">
            Class not found
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
            The class with ID "{id}" could not be found.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBackToDashboard}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        padding: 3,
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{ padding: 3, borderRadius: 2, maxWidth: 800, margin: "0 auto" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton onClick={handleBackToDashboard} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {classData.name}
          </Typography>
        </Box>

        <Typography variant="h6" color="text.secondary" gutterBottom>
          Code: {classData.code}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Schedule: {formatSchedule(classData.schedule)}
        </Typography>

        {classData.cr && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Class Representative: {classData.cr.name} ({classData.cr.email})
          </Typography>
        )}

        {classData.location && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Location: {classData.location.latitude.toFixed(6)},{" "}
            {classData.location.longitude.toFixed(6)}
          </Typography>
        )}

        {classData.allowedRadius && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Allowed Radius: {classData.allowedRadius} meters
          </Typography>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" component="span" color="text.secondary">
            Status:{" "}
          </Typography>
          {getStatusChip(classData.status) || (
            <Chip label="Active" color="default" sx={{ mt: 1 }} />
          )}
        </Box>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleMarkPresent}
          disabled={classData.status === "Cancelled" || markingAttendance}
          sx={{ position: "relative" }}
        >
          {markingAttendance ? (
            <>
              <CircularProgress
                size={24}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-12px",
                  marginLeft: "-12px",
                }}
              />
              Marking...
            </>
          ) : (
            "Mark Present"
          )}
        </Button>

        {classData.status === "Cancelled" && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This class has been cancelled. Attendance cannot be marked.
          </Typography>
        )}

        {!classData.location && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
            Note: No location set for this class. Attendance marking might not
            work properly.
          </Typography>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
