"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import { useRouter } from "next/navigation";

interface CourseItem {
  id: number;
  title: string;
  code: string;
  room: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  semester?: { name: string };
  _count?: { enrollments: number; attendances: number };
}

export default function InstructorCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInstructorCourses() {
      try {
        const res = await fetch("/api/instructor/courses");
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setCourses(result.data);
        }
      } catch (err) {
        console.error("Error loading instructor courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInstructorCourses();
  }, []);

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }} sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
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
            Instructor Workspace
          </Typography>
        </Box>
        <Typography variant="body1" color="#3730A3" sx={{ opacity: 0.9 }}>
          Manage your assigned courses, view student rosters, track attendance sheets, and override student statuses.
        </Typography>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
          <Typography variant="h6" fontWeight={700} color="#0F172A" mb={3}>
            My Assigned Taught Courses ({courses.length})
          </Typography>

          <Grid container spacing={3}>
            {courses.map((c) => (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0",
                    bgcolor: "#FFFFFF",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": { boxShadow: "0 10px 25px rgba(99, 102, 241, 0.1)", borderColor: "#6366F1" },
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
                      {c.semester?.name || "Semester"}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1} mb={1} color="text.secondary">
                      <AccessTimeOutlinedIcon fontSize="small" sx={{ color: "#64748B" }} />
                      <Typography variant="body2" color="#334155">
                        {c.dayOfWeek}: {c.startTime} - {c.endTime}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={1} color="text.secondary">
                      <RoomOutlinedIcon fontSize="small" sx={{ color: "#64748B" }} />
                      <Typography variant="body2" color="#334155">Room: {c.room}</Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <PeopleOutlinedIcon fontSize="small" sx={{ color: "#64748B" }} />
                      <Typography variant="body2" fontWeight={600} color="#334155">
                        {c._count?.enrollments ?? 0} Enrolled Students
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => router.push(`/instructor/courses/${c.id}`)}
                      sx={{ borderRadius: "10px", py: 1.1 }}
                    >
                      Open Course Register
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {courses.length === 0 && (
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px dashed #CBD5E1", borderRadius: "20px" }}>
                  <ClassOutlinedIcon sx={{ fontSize: 48, color: "#94A3B8", mb: 1 }} />
                  <Typography variant="h6" color="#1E293B" fontWeight={700}>
                    No courses assigned to you yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Please ask your academic administrator to assign you as an instructor to your courses.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
}
