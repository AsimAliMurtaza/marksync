"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import { Button } from "@mui/material";

interface ClassData {
  _id: string;
  name: string;
  code: string;
  schedule?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  timing?: string;
  status?: "On Time" | "Cancelled" | "Rescheduled";
  location?: {
    latitude: number;
    longitude: number;
  };
  allowedRadius?: number;
  cr?: {
    name: string;
    email: string;
  };
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

// Format time from 24h to 12h format
const formatTime = (time: string): string => {
  if (!time) return "TBA";

  try {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes || "00"} ${ampm}`;
  } catch (error) {
    return "TBA";
  }
};

// Format schedule for display - with null checks
const formatSchedule = (classItem: ClassData): string => {
  // If timing field exists, use it
  if (classItem.timing) {
    return classItem.timing;
  }

  // If schedule exists, format it
  if (classItem.schedule && classItem.schedule.dayOfWeek) {
    const dayAbbreviation = classItem.schedule.dayOfWeek.substring(0, 3);
    const startTime = formatTime(classItem.schedule.startTime);
    const endTime = formatTime(classItem.schedule.endTime);
    return `${dayAbbreviation} ${startTime} - ${endTime}`;
  }

  // Fallback if no schedule data
  return "Schedule not available";
};

// Mock fallback data
const mockClasses: ClassData[] = [
  {
    _id: "1",
    name: "Introduction to React",
    code: "CS50R",
    schedule: {
      dayOfWeek: "Monday",
      startTime: "09:00",
      endTime: "10:30",
    },
    status: "On Time",
  },
  {
    _id: "2",
    name: "Advanced JavaScript",
    code: "JS201",
    schedule: {
      dayOfWeek: "Tuesday",
      startTime: "11:00",
      endTime: "12:30",
    },
    status: "On Time",
  },
];

export default function Home() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });
  const router = useRouter();

  // Fetch classes from API
  const fetchClassesFromAPI = async (): Promise<ClassData[]> => {
    try {
      console.log("Fetching classes from API...");
      const response = await fetch("/api/classes");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      console.log("API Response:", result);

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch classes");
      }

      return result.data || [];
    } catch (error) {
      console.error("API fetch failed:", error);
      throw error; // Re-throw to handle in useEffect
    }
  };

  // Fetch initial class list on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchClassesFromAPI();
        setClasses(data);
        if (data.length === 0) {
          setSnackbar({
            open: true,
            message: "No classes found in database.",
            severity: "info",
          });
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        setSnackbar({
          open: true,
          message:
            "Failed to load classes from server. Please check if the API is running.",
          severity: "error",
        });
        setClasses([]); // Set empty array to show no classes
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleClassClick = (id: string) => {
    router.push(`/classes/${id}`);
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

  // Debug: Check what's in classes
  useEffect(() => {
    if (!loading) {
      console.log("Current classes state:", classes);
    }
  }, [classes, loading]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        padding: 3,
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
      }}
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper
            elevation={0}
            sx={{
              padding: 2,
              marginBottom: 3,
              textAlign: "center",
              backgroundColor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <Typography variant="h4" component="h1">
              Welcome to the Attendance App
            </Typography>
            <Typography variant="subtitle1">Your Class Dashboard</Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              {classes.length} classes found
            </Typography>
          </Paper>

          <Grid container spacing={3}>
            {classes.map((classItem) => (
              <Grid item xs={12} sm={6} md={4} key={classItem._id}>
                <Card
                  onClick={() => handleClassClick(classItem._id)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="div" gutterBottom>
                      {classItem.name}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      Code: {classItem.code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Timing: {formatSchedule(classItem)}
                    </Typography>
                    {classItem.cr && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        CR: {classItem.cr.name}
                      </Typography>
                    )}
                    {classItem.location && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Radius: {classItem.allowedRadius || 30}m
                      </Typography>
                    )}
                    {getStatusChip(classItem.status)}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {classes.length === 0 && !loading && (
            <Paper
              sx={{
                padding: 4,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No classes available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                There are no classes in the database. Please check your MongoDB
                connection.
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </Paper>
          )}
        </>
      )}

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
