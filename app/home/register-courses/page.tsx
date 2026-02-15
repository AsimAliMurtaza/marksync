"use client";

import { useEffect, useState } from "react";
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
  Button
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import { ClassForm, Semester } from "@/types/types";


export default function RegisterCoursesPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [classes, setClasses] = useState<ClassForm[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await fetch("/api/semesters");
        const data = await res.json();
        setSemesters(Array.isArray(data) ? data : []);
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
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleEnrollToggle = async (classId: string) => {
    const url = "/api/classes/enroll";

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ classId })
    });
    if(res.ok) {
      alert("Enrolled successfully");
    } else {
      alert("Error: " + (await res.text()));
    }
    // Refresh after enroll/unenroll
    fetchClassesForSemester(selectedSemester);
  };

   const handleUnenrollToggle = async (classId: string) => {
    const url = "/api/classes/unenroll";

    const res = await fetch(url, {
      method: "DELETE",
      body: JSON.stringify({ classId })
    });
    if(res.ok) {
      alert("Unenrolled successfully");
    } else {
      alert("Error: " + (await res.text()));
    }
    // Refresh after enroll/unenroll
    fetchClassesForSemester(selectedSemester);
  };

const columns = [
    { field: "title", headerName: "Title", flex: 1 },
    { field: "code", headerName: "Code", flex: 1 },
    { field: "room", headerName: "Room", flex: 1 },
    { field: "allowed_radius", headerName: "Radius (m)", flex: 1 },
    { field: "latitude", headerName: "Latitude", flex: 1 },
    { field: "longitude", headerName: "Longitude", flex: 1 },
    { field: "day_of_week", headerName: "Day of Week", flex: 1 },
    { field: "start_time", headerName: "Start Time", flex: 1 },
    { field: "end_time", headerName: "End Time", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 300,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", gap: 1}}>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              handleEnrollToggle(params.row.id)
            }
          >
            Enroll
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() =>
              handleUnenrollToggle(params.row.id)
            }
            >
            Unenroll
          </Button>
            </Box>
        );
      }
    }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Register for Courses
          </Typography>

          {loadingSemesters ? (
            <CircularProgress />
          ) : (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Semester</InputLabel>
              <Select
                value={selectedSemester}
                label="Select Semester"
                onChange={(e) => {
                  const id = e.target.value;
                  console.log(id)
                  setSelectedSemester(id);
                  fetchClassesForSemester(id);
                }}
              >
                {semesters.map((sem) => (
                  <MenuItem key={sem.id} value={sem.id}>
                    {sem.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {loadingClasses ? (
            <CircularProgress />
          ) : selectedSemester ? (
            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={classes.map((c) => ({ ...c, id: c.id }))}
                columns={columns}
                pageSizeOptions={[5, 10]}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  );
}
