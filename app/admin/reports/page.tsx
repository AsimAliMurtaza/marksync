"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  IconButton,
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import * as XLSX from "xlsx";

interface CourseOption {
  id: number;
  title: string;
  code: string;
  semester?: { name: string };
}

export default function AdminAttendanceReports() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportData, setReportData] = useState<{
    report: Record<string, string>[];
    dates: string[];
    course?: { title: string; code: string };
  } | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/admin/classes");
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setCourses(result.data);
          if (result.data.length > 0) {
            const firstId = String(result.data[0].id);
            setSelectedCourse(firstId);
            fetchReport(firstId);
          }
        }
      } catch (err) {
        console.error("Error loading courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    }
    loadCourses();
  }, []);

  const fetchReport = async (courseId: string) => {
    if (!courseId) return;
    try {
      setLoadingReport(true);
      const res = await fetch(`/api/attendance/report?classId=${courseId}`);
      const result = await res.json();
      if (result.success && result.data) {
        setReportData(result.data);
      } else {
        setReportData(null);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleExportExcel = () => {
    if (!reportData || !reportData.report.length) {
      alert("No data available to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(reportData.report);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Matrix");
    XLSX.writeFile(
      workbook,
      `Attendance_Report_${reportData.course?.code || "Course"}.xlsx`
    );
  };

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }} sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton onClick={() => router.push("/admin/dashboard")} sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0F172A">
              Attendance Reports & Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a course to inspect attendance matrices and download Excel spreadsheets.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<DownloadOutlinedIcon />}
          onClick={handleExportExcel}
          disabled={!reportData || !reportData.report.length}
          sx={{ borderRadius: "10px", width: { xs: "100%", sm: "auto" } }}
        >
          Export Excel (.xlsx)
        </Button>
      </Box>

      {loadingCourses ? (
        <CircularProgress size={28} color="primary" />
      ) : (
        <Paper elevation={0} sx={{ p: 3, mb: 3, border: "1px solid #E2E8F0", borderRadius: "16px", bgcolor: "#FFFFFF" }}>
          <FormControl fullWidth sx={{ maxWidth: 500 }}>
            <InputLabel>Select Target Course</InputLabel>
            <Select
              value={selectedCourse}
              label="Select Target Course"
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCourse(val);
                fetchReport(val);
              }}
            >
              {courses.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.code} - {c.title} ({c.semester?.name || "Semester"})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {loadingReport ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress color="primary" />
        </Box>
      ) : reportData && reportData.report.length > 0 ? (
        <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "16px", overflow: "hidden", bgcolor: "#FFFFFF" }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Email Address</TableCell>
                  {reportData.dates.map((dateStr) => (
                    <TableCell key={dateStr} align="center" sx={{ fontWeight: 700, color: "#475569" }}>
                      {dateStr}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>
                    Attendance Rate
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {reportData.report.map((row, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontWeight: 600, color: "#1E293B" }}>{row.Student}</TableCell>
                    <TableCell color="#64748B">{row.Email}</TableCell>
                    {reportData.dates.map((dateStr) => {
                      const status = row[dateStr];
                      return (
                        <TableCell key={dateStr} align="center">
                          <Chip
                            label={status}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              bgcolor:
                                status === "PRESENT"
                                  ? "#ECFDF5"
                                  : status === "EXCUSED"
                                  ? "#EFF6FF"
                                  : status === "LATE"
                                  ? "#FFFBEB"
                                  : "#FFF1F2",
                              color:
                                status === "PRESENT"
                                  ? "#059669"
                                  : status === "EXCUSED"
                                  ? "#2563EB"
                                  : status === "LATE"
                                  ? "#D97706"
                                  : "#E11D48",
                              border: "1px solid",
                              borderColor:
                                status === "PRESENT"
                                  ? "#A7F3D0"
                                  : status === "EXCUSED"
                                  ? "#BFDBFE"
                                  : status === "LATE"
                                  ? "#FDE68A"
                                  : "#FECDD3",
                            }}
                          />
                        </TableCell>
                      );
                    })}
                    <TableCell align="center" sx={{ fontWeight: 700, color: "#1E293B" }}>
                      {row["Percentage"]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        selectedCourse && (
          <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px dashed #CBD5E1", borderRadius: "16px", bgcolor: "#FFFFFF" }}>
            <Typography color="text.secondary">
              No attendance records found for the selected course yet.
            </Typography>
          </Paper>
        )
      )}
    </Box>
  );
}
