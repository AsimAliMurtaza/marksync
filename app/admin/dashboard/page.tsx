"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    semestersCount: 0,
    coursesCount: 0,
    studentsCount: 0,
    instructorsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminStats() {
      try {
        const [semRes, classRes, userRes] = await Promise.all([
          fetch("/api/admin/semesters"),
          fetch("/api/admin/classes"),
          fetch("/api/admin/users"),
        ]);

        const semesters = await semRes.json();
        const classesData = await classRes.json();
        const usersData = await userRes.json();

        const usersList = Array.isArray(usersData?.data) ? usersData.data : [];
        const coursesList = Array.isArray(classesData?.data)
          ? classesData.data
          : [];
        const semestersList = Array.isArray(semesters) ? semesters : [];

        const students = usersList.filter(
          (u: { role: string }) => u.role === "STUDENT"
        );
        const instructors = usersList.filter(
          (u: { role: string }) =>
            u.role === "INSTRUCTOR" || u.role === "ADMIN"
        );

        setStats({
          semestersCount: semestersList.length,
          coursesCount: coursesList.length,
          studentsCount: students.length,
          instructorsCount: instructors.length,
        });
      } catch (err) {
        console.error("Error loading admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminStats();
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
            Admin Control Center
          </Typography>
        </Box>
        <Typography variant="body1" color="#3730A3" sx={{ opacity: 0.9 }}>
          Manage academic semesters, course schedules, instructor assignments, student roles, and system reports.
        </Typography>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                icon={<SchoolOutlinedIcon sx={{ fontSize: 26, color: "#4F46E5" }} />}
                iconBg="#EEF2FF"
                value={stats.semestersCount}
                label="Active Semesters"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                icon={<ClassOutlinedIcon sx={{ fontSize: 26, color: "#0D9488" }} />}
                iconBg="#F0FDFA"
                value={stats.coursesCount}
                label="Total Courses"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                icon={<PeopleOutlinedIcon sx={{ fontSize: 26, color: "#D97706" }} />}
                iconBg="#FFFBEB"
                value={stats.studentsCount}
                label="Registered Students"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                icon={<HowToRegOutlinedIcon sx={{ fontSize: 26, color: "#7C3AED" }} />}
                iconBg="#F3E8FF"
                value={stats.instructorsCount}
                label="Course Instructors"
              />
            </Grid>
          </Grid>

          <Typography variant="h6" fontWeight={700} color="#0F172A" mb={2.5}>
            Management Workspaces
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <ActionCard
                title="Semesters & Courses"
                desc="Create semesters, set schedule times, geofences, and assign course instructors."
                btnText="Manage Semesters"
                btnColor="primary"
                onClick={() => router.push("/admin/semesters")}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <ActionCard
                title="User Roles & Access"
                desc="View registered accounts, filter by user roles, and assign Instructor or Admin permissions."
                btnText="Manage Users"
                btnColor="secondary"
                onClick={() => router.push("/admin/users")}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <ActionCard
                title="Attendance Analytics"
                desc="Inspect site-wide student attendance matrices and download custom Excel reports."
                btnText="Export Reports"
                btnColor="primary"
                onClick={() => router.push("/admin/reports")}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

function MetricCard({
  icon,
  iconBg,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: number;
  label: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            bgcolor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function ActionCard({
  title,
  desc,
  btnText,
  btnColor,
  onClick,
}: {
  title: string;
  desc: string;
  btnText: string;
  btnColor: "primary" | "secondary";
  onClick: () => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3.5,
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box mb={2}>
        <Typography variant="h6" fontWeight={700} color="#0F172A" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {desc}
        </Typography>
      </Box>
      <Button
        variant="contained"
        color={btnColor}
        fullWidth
        onClick={onClick}
        endIcon={<ArrowForwardOutlinedIcon fontSize="small" />}
        sx={{ borderRadius: "10px", py: 1.1, textTransform: "none" }}
      >
        {btnText}
      </Button>
    </Paper>
  );
}
