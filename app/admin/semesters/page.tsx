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
  Chip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SemesterItem {
  id: number | string;
  name: string;
  startDate: string;
  endDate: string;
  start_date?: string;
  end_date?: string;
  _count?: { courses: number };
}

export default function SemesterManagement() {
  const { data: session } = useSession();
  const router = useRouter();

  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    id: "",
    name: "",
    start_date: "",
    end_date: "",
  });

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/semesters");
      const data = await res.json();
      setSemesters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch semesters:", error);
    } finally {
      setLoading(false);
    }
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

  const handleOpenEdit = (sem: SemesterItem) => {
    setEditMode(true);
    const sDate = sem.startDate || sem.start_date || "";
    const eDate = sem.endDate || sem.end_date || "";

    setForm({
      id: String(sem.id),
      name: sem.name,
      start_date: sDate.split("T")[0],
      end_date: eDate.split("T")[0],
    });
    setOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this semester?")) return;

    await fetch(`/api/admin/semesters/${id}`, { method: "DELETE" });
    fetchSemesters();
  };

  const handleSave = async () => {
    if (!form.name || !form.start_date || !form.end_date) {
      alert("Please fill in all fields");
      return;
    }

    const payload = {
      name: form.name,
      startDate: form.start_date,
      endDate: form.end_date,
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
    <Box p={{ xs: 2, sm: 3, md: 4 }} sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton onClick={() => router.push("/admin/dashboard")} sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0F172A">
              Semester Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Define academic terms, semester dates, and manage associated course schedules.
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" onClick={handleOpenAdd} sx={{ borderRadius: "10px" }}>
          Add New Semester
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "16px", overflow: "hidden", bgcolor: "#FFFFFF" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Semester Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>End Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Courses</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "#475569" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {semesters.map((sem) => {
                const sDate = (sem.startDate || sem.start_date || "").split("T")[0];
                const eDate = (sem.endDate || sem.end_date || "").split("T")[0];
                return (
                  <TableRow key={sem.id} hover sx={{ cursor: "pointer" }}>
                    <TableCell
                      sx={{ fontWeight: 700, color: "#4F46E5" }}
                      onClick={() => router.push(`/admin/semesters/${sem.id}`)}
                    >
                      {sem.name}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/admin/semesters/${sem.id}`)} color="#334155">
                      {sDate}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/admin/semesters/${sem.id}`)} color="#334155">
                      {eDate}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/admin/semesters/${sem.id}`)}>
                      <Chip
                        label={`${sem._count?.courses ?? 0} Courses`}
                        size="small"
                        sx={{
                          bgcolor: "#EEF2FF",
                          color: "#4F46E5",
                          fontWeight: 700,
                          border: "1px solid #E0E7FF",
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/semesters/${sem.id}`);
                        }}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="info"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(sem);
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sem.id);
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!loading && semesters.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No semesters found. Create one to get started.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog Form */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editMode ? "Edit Semester" : "Add New Semester"}</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Semester Name (e.g. Fall 2026)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />

          <TextField
            fullWidth
            margin="dense"
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            sx={{ mb: 2 }}
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

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#64748B" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: "8px" }}>
            {editMode ? "Save Changes" : "Create Semester"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
