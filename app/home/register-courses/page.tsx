"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Paper,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

interface Semester {
  id: number;
  name: string;
}

interface CourseItem {
  id: number;
  title: string;
  code: string;
  room: string;
  allowed_radius: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  isEnrolled?: boolean;
  instructor?: { name: string };
}

export default function RegisterCoursesPage() {
  const router = useRouter();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [classes, setClasses] = useState<CourseItem[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await fetch("/api/semesters");
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setSemesters(list);
        if (list.length > 0) {
          const firstId = String(list[0].id);
          setSelectedSemester(firstId);
          fetchClassesForSemester(firstId);
        }
      } catch {
        setSemesters([]);
      } finally {
        setLoadingSemesters(false);
      }
    };

    fetchSemesters();
  }, []);

  const fetchClassesForSemester = async (id: string) => {
    setLoadingClasses(true);
    try {
      const res = await fetch(`/api/semesters/${id}/classes`);
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleEnrollToggle = async (classId: number, currentlyEnrolled?: boolean) => {
    const endpoint = currentlyEnrolled ? "/api/classes/unenroll" : "/api/classes/enroll";
    const method = currentlyEnrolled ? "DELETE" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId }),
    });

    if (res.ok) {
      setClasses(
        classes.map((c) =>
          c.id === classId ? { ...c, isEnrolled: !currentlyEnrolled } : c
        )
      );
    } else {
      const errText = await res.text();
      alert("Error: " + errText);
    }
  };

  const columns: GridColDef[] = [
    { field: "code", headerName: "Code", width: 110 },
    { field: "title", headerName: "Course Title", flex: 1.5, minWidth: 180 },
    {
      field: "instructor",
      headerName: "Instructor",
      flex: 1,
      minWidth: 140,
      valueGetter: (_value, row) => row.instructor?.name || "TBA",
    },
    { field: "room", headerName: "Room", width: 100 },
    { field: "day_of_week", headerName: "Day", width: 120 },
    {
      field: "schedule",
      headerName: "Time",
      width: 140,
      valueGetter: (_value, row) => `${row.start_time} - ${row.end_time}`,
    },
    {
      field: "actions",
      headerName: "Registration",
      width: 170,
      renderCell: (params: GridRenderCellParams) => {
        const isEnrolled = params.row.isEnrolled;
        return (
          <Box display="flex" alignItems="center" height="100%">
            {isEnrolled ? (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleEnrollToggle(params.row.id, true)}
                sx={{ borderRadius: "8px", textTransform: "none" }}
              >
                Unenroll
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleEnrollToggle(params.row.id, false)}
                sx={{ borderRadius: "8px", textTransform: "none" }}
              >
                Enroll Course
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <IconButton onClick={() => router.push("/home")} sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="h5" fontWeight={800} color="#0F172A">
          Course Registration Portal
        </Typography>
      </Box>

      <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "20px", bgcolor: "#FFFFFF" }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select an academic semester to explore offered courses and manage your course registrations.
          </Typography>

          {loadingSemesters ? (
            <CircularProgress size={28} />
          ) : (
            <FormControl fullWidth sx={{ maxWidth: 500, mb: 3 }}>
              <InputLabel>Select Academic Semester</InputLabel>
              <Select
                value={selectedSemester}
                label="Select Academic Semester"
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedSemester(id);
                  fetchClassesForSemester(id);
                }}
              >
                {semesters.map((sem) => (
                  <MenuItem key={sem.id} value={String(sem.id)}>
                    {sem.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {loadingClasses ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : selectedSemester ? (
            <Paper elevation={0} style={{ height: 480, width: "100%", border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
              <DataGrid
                rows={classes}
                columns={columns}
                getRowId={(row) => row.id}
                pageSizeOptions={[5, 10, 20]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: "#F8FAFC",
                    borderBottom: "1px solid #E2E8F0",
                    fontWeight: 700,
                  },
                }}
              />
            </Paper>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  );
}
