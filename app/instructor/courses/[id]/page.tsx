"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import * as XLSX from "xlsx";

interface StudentAttendanceRecord {
  studentId: number;
  name: string;
  email: string;
  status: string;
  timestamp?: string;
}

interface CourseHeader {
  id: number;
  title: string;
  code: string;
  room: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export default function InstructorCourseDetailWorkspace() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseHeader | null>(null);
  const [students, setStudents] = useState<StudentAttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);

  const fetchAttendanceData = useCallback(async (dateStr: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/instructor/courses/${courseId}/attendance?date=${dateStr}`
      );
      const result = await res.json();
      if (result.success && result.data) {
        setCourse(result.data.course);
        setStudents(result.data.students || []);
      }
    } catch (err) {
      console.error("Error loading attendance:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) fetchAttendanceData(selectedDate);
  }, [courseId, selectedDate, fetchAttendanceData]);

  const handleUpdateStatus = async (studentId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          status: newStatus,
          date: selectedDate,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setStudents(
          students.map((s) =>
            s.studentId === studentId ? { ...s, status: newStatus } : s
          )
        );
      } else {
        alert("Failed to update status: " + result.error);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status");
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await fetch(`/api/attendance/report?classId=${courseId}`);
      const result = await res.json();
      if (result.success && result.data?.report?.length) {
        const worksheet = XLSX.utils.json_to_sheet(result.data.report);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
        XLSX.writeFile(
          workbook,
          `${course?.code || "Course"}_Attendance_Report.xlsx`
        );
      } else {
        alert("No attendance data available to export.");
      }
    } catch (err) {
      console.error("Error exporting report:", err);
      alert("Error exporting report");
    }
  };

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }} sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      {/* Top Bar */}
      <Box
        display="flex"
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton onClick={() => router.push("/instructor/courses")} sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0F172A">
              {course ? `${course.title} (${course.code})` : "Course Register"}
            </Typography>
            {course && (
              <Typography variant="body2" color="text.secondary">
                Room: {course.room} | Schedule: {course.dayOfWeek} ({course.startTime} - {course.endTime})
              </Typography>
            )}
          </Box>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<DownloadOutlinedIcon />}
          onClick={handleExportExcel}
          sx={{ borderRadius: "10px", width: { xs: "100%", sm: "auto" } }}
        >
          Export Excel Report
        </Button>
      </Box>

      {/* Date Picker & Controls */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: "1px solid #E2E8F0", borderRadius: "16px", bgcolor: "#FFFFFF" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="subtitle2" fontWeight={700} color="#334155">
              Select Date:
            </Typography>
            <TextField
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{ bgcolor: "#F8FAFC" }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Enrolled: <strong>{students.length}</strong> | Present:{" "}
            <strong style={{ color: "#059669" }}>
              {students.filter((s) => s.status === "PRESENT").length}
            </strong>
          </Typography>
        </Box>
      </Paper>

      {/* Roster & Attendance Matrix */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "16px", overflow: "hidden", bgcolor: "#FFFFFF" }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Email Address</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Attendance Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>
                    Manual Override Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.studentId} hover>
                    <TableCell sx={{ fontWeight: 600, color: "#1E293B" }}>{student.name}</TableCell>
                    <TableCell color="#64748B">{student.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.status}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor:
                            student.status === "PRESENT"
                              ? "#ECFDF5"
                              : student.status === "LATE"
                              ? "#FFFBEB"
                              : student.status === "EXCUSED"
                              ? "#EFF6FF"
                              : student.status === "ABSENT"
                              ? "#FFF1F2"
                              : "#F1F5F9",
                          color:
                            student.status === "PRESENT"
                              ? "#059669"
                              : student.status === "LATE"
                              ? "#D97706"
                              : student.status === "EXCUSED"
                              ? "#2563EB"
                              : student.status === "ABSENT"
                              ? "#E11D48"
                              : "#64748B",
                          border: "1px solid",
                          borderColor:
                            student.status === "PRESENT"
                              ? "#A7F3D0"
                              : student.status === "LATE"
                              ? "#FDE68A"
                              : student.status === "EXCUSED"
                              ? "#BFDBFE"
                              : student.status === "ABSENT"
                              ? "#FECDD3"
                              : "#E2E8F0",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
                        <Button
                          size="small"
                          variant={student.status === "PRESENT" ? "contained" : "outlined"}
                          color="success"
                          onClick={() => handleUpdateStatus(student.studentId, "PRESENT")}
                          sx={{ borderRadius: "8px", textTransform: "none", py: 0.5, px: 1.5 }}
                        >
                          Present
                        </Button>
                        <Button
                          size="small"
                          variant={student.status === "ABSENT" ? "contained" : "outlined"}
                          color="error"
                          onClick={() => handleUpdateStatus(student.studentId, "ABSENT")}
                          sx={{ borderRadius: "8px", textTransform: "none", py: 0.5, px: 1.5 }}
                        >
                          Absent
                        </Button>
                        <Button
                          size="small"
                          variant={student.status === "LATE" ? "contained" : "outlined"}
                          color="warning"
                          onClick={() => handleUpdateStatus(student.studentId, "LATE")}
                          sx={{ borderRadius: "8px", textTransform: "none", py: 0.5, px: 1.5 }}
                        >
                          Late
                        </Button>
                        <Button
                          size="small"
                          variant={student.status === "EXCUSED" ? "contained" : "outlined"}
                          color="info"
                          onClick={() => handleUpdateStatus(student.studentId, "EXCUSED")}
                          sx={{ borderRadius: "8px", textTransform: "none", py: 0.5, px: 1.5 }}
                        >
                          Excused
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No students enrolled in this course roster yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
