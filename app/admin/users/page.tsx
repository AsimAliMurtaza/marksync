"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count?: { enrollments: number; taughtCourses: number };
}

export default function AdminUserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("ALL");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const result = await res.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const result = await res.json();
      if (result.success) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      } else {
        alert("Failed to update role: " + result.error);
      }
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Error updating role");
    }
  };

  const filteredUsers = users.filter((u) =>
    filterRole === "ALL" ? true : u.role === filterRole
  );

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }} sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton onClick={() => router.push("/admin/dashboard")} sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0F172A">
              User Account Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assign user roles (Student, Instructor, Admin) and manage system permissions.
            </Typography>
          </Box>
        </Box>

        <FormControl size="small" sx={{ width: 180, bgcolor: "#FFFFFF" }}>
          <InputLabel>Filter by Role</InputLabel>
          <Select
            value={filterRole}
            label="Filter by Role"
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <MenuItem value="ALL">All Roles</MenuItem>
            <MenuItem value="STUDENT">Students</MenuItem>
            <MenuItem value="INSTRUCTOR">Instructors</MenuItem>
            <MenuItem value="ADMIN">Admins</MenuItem>
          </Select>
        </FormControl>
      </Box>

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
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>User Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Email Address</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Current Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Enrolled / Taught</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Change Role</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: "#1E293B" }}>{u.name}</TableCell>
                    <TableCell color="#64748B">{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor:
                            u.role === "ADMIN"
                              ? "#FFF1F2"
                              : u.role === "INSTRUCTOR"
                              ? "#EEF2FF"
                              : "#F1F5F9",
                          color:
                            u.role === "ADMIN"
                              ? "#E11D48"
                              : u.role === "INSTRUCTOR"
                              ? "#4F46E5"
                              : "#475569",
                          border: "1px solid",
                          borderColor:
                            u.role === "ADMIN"
                              ? "#FECDD3"
                              : u.role === "INSTRUCTOR"
                              ? "#E0E7FF"
                              : "#E2E8F0",
                        }}
                      />
                    </TableCell>
                    <TableCell color="#334155">
                      {u.role === "STUDENT"
                        ? `${u._count?.enrollments ?? 0} Enrolled Courses`
                        : `${u._count?.taughtCourses ?? 0} Taught Courses`}
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        sx={{ fontSize: "0.85rem", height: 34, borderRadius: "8px", bgcolor: "#F8FAFC" }}
                      >
                        <MenuItem value="STUDENT">Student</MenuItem>
                        <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No users found matching filter.</Typography>
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
