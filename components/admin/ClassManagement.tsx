"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { ClassData, ClassForm } from "@/types/types";
import { useSession } from "next-auth/react";

export default function ClassManagement() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const session = useSession();

  const [form, setForm] = useState<ClassForm>({
    name: "",
    code: "",
    allowedRadius: 30,
    location: { latitude: 0, longitude: 0 },
    schedule: { dayOfWeek: "", startTime: "", endTime: "", room: "" },
    createdBy: "",
  });
  // Fetch all classes
  const fetchClasses = async () => {
    const res = await fetch("/api/admin/classes");
    const result = await res.json();
    if (result.success) setClasses(result.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleChange = (field: string, value: string | number): void => {
    if (field.startsWith("location.")) {
      const subField = field.split(".")[1] as keyof ClassForm["location"];
      setForm((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [subField]: Number(value),
        },
      }));
    } else if (field.startsWith("schedule.")) {
      const subField = field.split(".")[1] as keyof ClassForm["schedule"];
      setForm((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [subField]: value as string,
        },
      }));
    } else {
      const key = field as keyof ClassForm;
      setForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleSave = async () => {
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `/api/admin/classes/${form._id}` : `/api/admin/classes`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await res.json();
    if (result.success) {
      setOpenDialog(false);
      fetchClasses();
    } else {
      alert(result.error || "Error saving class");
    }
  };

  const handleEdit = (cls: ClassData) => {
    setEditMode(true);
    setForm(cls as ClassForm);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    const res = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) fetchClasses();
  };

  const handleAdd = () => {
    setEditMode(false);
    setForm({
      name: "",
      code: "",
      location: { latitude: 0, longitude: 0 },
      allowedRadius: 30,
      //need to update schedule to include different days in the same class object
      schedule: {
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        room: "",
      },
      createdBy: session.data?.user?.id || "",
    });
    setOpenDialog(true);
  };

  if (loading)
    return (
      <Box textAlign="center">
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Class Management
      </Typography>

      <Paper>
        <List>
          {classes.map((cls) => (
            <ListItem
              key={cls._id}
              secondaryAction={
                <>
                  <IconButton onClick={() => handleEdit(cls)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(cls._id!)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={cls.name}
                secondary={`${cls.code} — ${cls.schedule.dayOfWeek} (${cls.schedule.startTime}-${cls.schedule.endTime}) | Room: ${cls.schedule.room}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Button variant="contained" sx={{ mt: 3 }} onClick={handleAdd}>
        Add New Class
      </Button>

      {/* Dialog for Add/Edit */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>{editMode ? "Edit Class" : "Add New Class"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Class Name"
                fullWidth
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Class Code"
                fullWidth
                value={form.code}
                onChange={(e) => handleChange("code", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Latitude"
                type="number"
                fullWidth
                value={form.location.latitude}
                onChange={(e) =>
                  handleChange("location.latitude", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Longitude"
                type="number"
                fullWidth
                value={form.location.longitude}
                onChange={(e) =>
                  handleChange("location.longitude", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Allowed Radius (meters)"
                type="number"
                fullWidth
                value={form.allowedRadius}
                onChange={(e) => handleChange("allowedRadius", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Room"
                fullWidth
                value={form.schedule.room}
                onChange={(e) => handleChange("schedule.room", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Day of Week"
                fullWidth
                value={form.schedule.dayOfWeek}
                onChange={(e) =>
                  handleChange("schedule.dayOfWeek", e.target.value)
                }
              >
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                value={form.schedule.startTime}
                onChange={(e) =>
                  handleChange("schedule.startTime", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="End Time"
                type="time"
                fullWidth
                value={form.schedule.endTime}
                onChange={(e) =>
                  handleChange("schedule.endTime", e.target.value)
                }
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
