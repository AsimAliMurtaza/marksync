"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SemesterManagement() {
  const { data: session } = useSession();

  const [semesters, setSemesters] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    start_date: "",
    end_date: "",
  });

  const fetchSemesters = async () => {
    const res = await fetch("/api/admin/semesters");
    const data = await res.json();
    setSemesters(data);
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({
      id: "",
      name: "",
      start_date: "",
      end_date: "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (sem: any) => {
    setEditMode(true);
    setForm({
      id: sem.id,
      name: sem.name,
      start_date: sem.start_date?.split("T")[0],
      end_date: sem.end_date?.split("T")[0],
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete semester?")) return;

    await fetch(`/api/admin/semesters/${id}`, { method: "DELETE" });
    fetchSemesters();
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      start_date: form.start_date,
      end_date: form.end_date,
      created_by: session?.user?.id,
    };

    if (editMode) {
      await fetch(`/api/admin/semesters/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`/api/admin/semesters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setOpen(false);
    fetchSemesters();
  };

  return (
    <Box p={4}>
      <Typography variant="h5" mb={3}>
        Semester Management
      </Typography>

      <Button variant="contained" onClick={handleOpenAdd} sx={{ mb: 2 }}>
        Add New Semester
      </Button>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Semester Name</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {semesters.map((sem: any) => (
                <TableRow key={sem.id}>
                  <Link
                    href={`/admin/semesters/${sem.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}>
                    <TableCell>{sem.name}</TableCell>
                  </Link>
                    <TableCell>{sem.start_date?.split("T")[0]}</TableCell>
                    <TableCell>{sem.end_date?.split("T")[0]}</TableCell>

                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenEdit(sem)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(sem.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {semesters.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No semesters found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editMode ? "Edit Semester" : "Add Semester"}</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Semester Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <TextField
            fullWidth
            margin="dense"
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />

          <TextField
            fullWidth
            margin="dense"
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
