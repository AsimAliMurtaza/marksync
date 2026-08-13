"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useSession } from "next-auth/react";

export interface ManagedClass {
  id?: string;
  title: string;
  code: string;
  room: string;
  allowed_radius: number;
  latitude: number;
  longitude: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  created_by: string;
  semester_id: string;
  instructor_id?: string;
  instructor_name?: string;
}

export interface InstructorOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ClassesManager({
  semesterId,
  initialData,
  instructors,
}: {
  semesterId: string;
  initialData: ManagedClass[];
  instructors: InstructorOption[];
}) {
  const [classes, setClasses] = useState<ManagedClass[]>(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedClass | null>(null);
  const session = useSession();

  const [form, setForm] = useState<ManagedClass>({
    title: "",
    code: "",
    room: "",
    allowed_radius: 30,
    latitude: 31.5204,
    longitude: 74.3587,
    day_of_week: "Monday",
    start_time: "09:00",
    end_time: "10:30",
    created_by: session.data?.user?.id || "1",
    semester_id: semesterId,
    instructor_id: "",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      code: "",
      room: "",
      allowed_radius: 30,
      latitude: 31.5204,
      longitude: 74.3587,
      day_of_week: "Monday",
      start_time: "09:00",
      end_time: "10:30",
      created_by: session.data?.user?.id || "1",
      semester_id: semesterId,
      instructor_id: instructors.length > 0 ? instructors[0].id : "",
    });
    setModalOpen(true);
  };

  const openEdit = (cls: ManagedClass) => {
    setEditing(cls);
    setForm({
      id: cls.id,
      title: cls.title,
      code: cls.code,
      room: cls.room,
      allowed_radius: cls.allowed_radius,
      latitude: cls.latitude,
      longitude: cls.longitude,
      day_of_week: cls.day_of_week,
      start_time: cls.start_time,
      end_time: cls.end_time,
      created_by: cls.created_by,
      semester_id: cls.semester_id,
      instructor_id: cls.instructor_id || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = async () => {
    if (!form.title || !form.code) {
      alert("Course Title and Code are required.");
      return;
    }

    const url = editing
      ? `/api/admin/classes/${editing.id}`
      : "/api/admin/classes";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        semester_id: semesterId,
        instructor_id: form.instructor_id || null,
      }),
    });

    const result = await res.json();
    if (result.success && result.data) {
      const updatedClass: ManagedClass = {
        id: String(result.data.id),
        title: result.data.title,
        code: result.data.code,
        room: result.data.room,
        allowed_radius: Number(result.data.allowedRadius),
        latitude: Number(result.data.latitude),
        longitude: Number(result.data.longitude),
        day_of_week: result.data.dayOfWeek,
        start_time: result.data.startTime,
        end_time: result.data.endTime,
        created_by: String(result.data.createdBy),
        semester_id: String(result.data.semesterId),
        instructor_id: result.data.instructorId ? String(result.data.instructorId) : "",
        instructor_name: result.data.instructor?.name || "Unassigned",
      };

      if (editing) {
        setClasses(classes.map((c) => (c.id === editing.id ? updatedClass : c)));
      } else {
        setClasses([...classes, updatedClass]);
      }
      closeModal();
    } else {
      alert(result.error || "Failed to save class");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    const res = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
    if (res.ok) setClasses(classes.filter((c) => c.id !== id));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
      },
      (err) => alert("Could not get location: " + err.message)
    );
  };

  const columns: GridColDef[] = [
    { field: "code", headerName: "Code", width: 110 },
    { field: "title", headerName: "Course Title", flex: 1.5, minWidth: 160 },
    { field: "instructor_name", headerName: "Instructor", flex: 1, minWidth: 140 },
    { field: "room", headerName: "Room", width: 90 },
    { field: "day_of_week", headerName: "Day", width: 110 },
    {
      field: "schedule",
      headerName: "Schedule",
      width: 140,
      valueGetter: (_value, row) => `${row.start_time} - ${row.end_time}`,
    },
    { field: "allowed_radius", headerName: "Radius (m)", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={1} alignItems="center" height="100%">
          <Button
            size="small"
            variant="outlined"
            onClick={() => openEdit(params.row)}
            sx={{ borderRadius: "6px", textTransform: "none" }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => handleDelete(params.row.id)}
            sx={{ borderRadius: "6px", textTransform: "none" }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Box display="flex" justifyContent="flex-end" mb={2.5}>
        <Button variant="contained" onClick={openCreate} sx={{ borderRadius: "10px" }}>
          Add Course to Semester
        </Button>
      </Box>

      <Paper elevation={0} sx={{ height: 480, border: "1px solid #E2E8F0", borderRadius: "16px", overflow: "hidden", bgcolor: "#FFFFFF" }}>
        <DataGrid
          rows={classes}
          columns={columns}
          getRowId={(row) => row.id || row.code}
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

      {/* Modal */}
      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editing ? "Edit Course" : "Create New Course"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Box display="flex" gap={2} flexDirection={{ xs: "column", sm: "row" }}>
            <TextField
              label="Course Title"
              fullWidth
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <TextField
              label="Course Code"
              sx={{ width: { xs: "100%", sm: 180 } }}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </Box>

          <Box display="flex" gap={2} flexDirection={{ xs: "column", sm: "row" }}>
            <FormControl fullWidth>
              <InputLabel>Course Instructor</InputLabel>
              <Select
                value={form.instructor_id}
                label="Course Instructor"
                onChange={(e) => setForm({ ...form, instructor_id: e.target.value })}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {instructors.map((inst) => (
                  <MenuItem key={inst.id} value={inst.id}>
                    {inst.name} ({inst.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Room / Lab"
              sx={{ width: { xs: "100%", sm: 180 } }}
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
            />
          </Box>

          <Box display="flex" gap={2} flexDirection={{ xs: "column", sm: "row" }}>
            <FormControl fullWidth>
              <InputLabel>Day of Week</InputLabel>
              <Select
                value={form.day_of_week}
                label="Day of Week"
                onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
              >
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Start Time"
              placeholder="09:00"
              fullWidth
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            />
            <TextField
              label="End Time"
              placeholder="10:30"
              fullWidth
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            />
          </Box>

          <Typography variant="subtitle2" fontWeight={700} color="#0F172A" mt={1}>
            Location & Geofencing Parameters
          </Typography>

          <Box display="flex" gap={2} alignItems="center" flexDirection={{ xs: "column", sm: "row" }}>
            <TextField
              label="Target Latitude"
              type="number"
              fullWidth
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })}
            />
            <TextField
              label="Target Longitude"
              type="number"
              fullWidth
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })}
            />
            <Button variant="outlined" onClick={getCurrentLocation} sx={{ whiteSpace: "nowrap", borderRadius: "8px", textTransform: "none" }}>
              Get GPS Location
            </Button>
          </Box>

          <TextField
            label="Allowed Radius (Meters)"
            type="number"
            value={form.allowed_radius}
            onChange={(e) => setForm({ ...form, allowed_radius: Number(e.target.value) })}
            helperText="Maximum allowed distance for student attendance verification."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={closeModal} sx={{ color: "#64748B" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: "8px" }}>
            Save Course
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
