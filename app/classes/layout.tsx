"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "@/components/Sidebar";

export default function MarkSyncLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  console.log("Sidebar open state:", sidebarOpen);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar onToggle={setSidebarOpen} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: "margin-left 0.3s ease",
          backgroundColor: "#f5f7fa",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
