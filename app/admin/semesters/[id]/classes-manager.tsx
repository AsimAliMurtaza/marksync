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
} from "@mui/material";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import { ClassForm } from "@/types/types";
import { useSession } from "next-auth/react";

export default function ClassesManager({ semesterId, initialData }: { semesterId: string; initialData: ClassForm[] }) {
  const [classes, setClasses] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClassForm | null>(null);
    const session = useSession();
  const [form, setForm] = useState<ClassForm>({
    title: "",
    code: "",
    room: "",
    allowed_radius: 30,
    latitude: 0,
    longitude: 0,
    day_of_week: "",
    start_time: "",
    end_time: "",
    created_by: session.data?.user?.id || "",
    semester_id: semesterId,
    users: [],
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      code: "",
      room: "",
      allowed_radius: 30,
      latitude: 0,
      longitude: 0,
      day_of_week: "",
      start_time: "",
      end_time: "",
      created_by: session.data?.user?.id || "",
      semester_id: semesterId,
      users: [], // Initialize users as an empty array for new classes
    });
    setModalOpen(true);
  };

  const openEdit = (cls : ClassForm) => {
    setEditing(cls);
    setForm({
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
      users: cls.users || [], // Pass users if available
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = async () => {
    const url = editing
      ? `/api/admin/classes/${editing.id}`
      : "/api/admin/classes";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, semester_id: semesterId }),
    });

    const result = await res.json();
    if (result.success) {
      if (editing) {
        setClasses(classes.map((c) => (c.id === editing.id ? result.data : c)));
      } else {
        setClasses([...classes, result.data]);
      }
      closeModal();
    } else alert(result.error);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete class?")) return;
    const res = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
    if (res.ok) setClasses(classes.filter((c) => c.id !== id));
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
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={1}>
          <Button size="small" onClick={() => openEdit(params.row)}>
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Button variant="contained" sx={{ mb: 2 }} onClick={openCreate}>
        Add Class
      </Button>

      <Box height={400}>
        <DataGrid rows={classes} columns={columns} getRowId={(row) => row.id || ""} />
      </Box>

      <Dialog open={modalOpen} onClose={closeModal}>
        <DialogTitle>{editing ? "Edit Class" : "Add Class"}</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            label="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <TextField
            label="Room"
            value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}
          />
          <TextField
            label="Radius (m)"
            type="number"
            value={form.allowed_radius}
            onChange={(e) =>
              setForm({ ...form, allowed_radius: Number(e.target.value) })
            }
          />
          <TextField
            label="Latitude"
            type="number"
            value={form.latitude}
            onChange={(e) =>
              setForm({ ...form, latitude: Number(e.target.value) })
            }
          />
          <TextField
            label="Longitude"
            type="number"
            value={form.longitude}
            onChange={(e) =>
              setForm({ ...form, longitude: Number(e.target.value) })
            }
          />
          <TextField
            label="Day of Week"
            value={form.day_of_week}
            onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
          />
          <TextField
            label="Start Time"
            type="datetime-local"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Time"
            type="datetime-local"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
