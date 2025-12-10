"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import * as XLSX from "xlsx";
import {ClassData} from "@/types/types";

interface SelectedClass {
  _id: string;
  name: string;
  code: string;
  location: { latitude: number; longitude: number };
}


export default function AttendanceReports() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedClassObj, setSelectedClassObj] = useState<SelectedClass | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchClasses = async () => {
      const res = await fetch("/api/admin/classes");
      const result = await res.json();
      if (result.success) setClasses(result.data);
    };
    fetchClasses();
  }, []);

  const handleClassChange = (event: SelectChangeEvent<string>) => {
    const id = event.target.value as string;
    setSelectedClass(id);
    const found = classes.find((cls) => cls._id === id);
    setSelectedClassObj((found as SelectedClass) || null);
  };

  const handleExport = async () => {
    if (!selectedClassObj) return alert("Select a class first!");

    setLoading(true);
    const res = await fetch(`/api/attendance/report?classId=${selectedClass}`);
    const result = await res.json();
    setLoading(false);

    if (!result.success) return alert("Failed to generate report.");

    const reportData = result.data.report || [];

    // 🧾 Add class info as the first two rows
    const classHeader = [
      { "Class Name": selectedClassObj.name, "Class Code": selectedClassObj.code },
      {}, // Empty row separator
      ...reportData,
    ];

    // Create Excel sheet
    const worksheet = XLSX.utils.json_to_sheet(classHeader, { skipHeader: false });
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    // Create filename like "Attendance_BSCS101_DataStructures.xlsx"
    const fileName = `Attendance_${selectedClassObj.code}_${selectedClassObj.name.replace(
      /\s+/g,
      "_"
    )}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Attendance Reports
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Class</InputLabel>
        <Select
          value={selectedClass}
          label="Select Class"
          onChange={handleClassChange}
        >
          {classes.map((cls) => (
            <MenuItem key={cls._id} value={cls._id}>
              {cls.name} ({cls.code})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        onClick={handleExport}
        disabled={!selectedClass || loading}
      >
        {loading ? <CircularProgress size={24} /> : "Download Report"}
      </Button>
    </Box>
  );
}
