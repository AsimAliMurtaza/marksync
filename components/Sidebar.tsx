"use client";

import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
  Typography,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ClassIcon from "@mui/icons-material/Class";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FiLogOut } from "react-icons/fi";
import { MdClass } from "react-icons/md";

export const drawerWidth = 220;
export const collapsedWidth = 76;

export default function Sidebar({
  onToggle,
}: {
  onToggle?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role;
  const isAdmin = role === "ADMIN" || role === "admin";
  const isInstructor = role === "INSTRUCTOR" || role === "instructor";

  const toggleDrawer = () => {
    setOpen((prev) => {
      const newOpen = !prev;
      onToggle?.(newOpen);
      return newOpen;
    });
  };

  const getMenuItems = () => {
    const items = [{ text: "Home Dashboard", icon: <HomeIcon />, route: "/home" }];

    if (isAdmin) {
      items.push(
        { text: "Admin Overview", icon: <AssessmentIcon />, route: "/admin/dashboard" },
        { text: "Semesters & Courses", icon: <SchoolIcon />, route: "/admin/semesters" },
        { text: "User Management", icon: <PeopleIcon />, route: "/admin/users" },
        { text: "Attendance Reports", icon: <AssessmentIcon />, route: "/admin/reports" }
      );
    }

    if (isInstructor || isAdmin) {
      items.push({
        text: "Instructor Workspace",
        icon: <ClassIcon />,
        route: "/instructor/courses",
      });
    }

    // Student / General items
    items.push(
      { text: "Course Registration", icon: <MdClass />, route: "/home/register-courses" },
      { text: "My Profile", icon: <AccountCircleIcon />, route: "/profile" }
    );

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : collapsedWidth,
          transition: "width 0.3s ease",
          overflowX: "hidden",
          bgcolor: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          borderRadius: 0,
          display: "flex",
          flexDirection: "column",
          boxShadow: "2px 0 12px rgba(0,0,0,0.03)",
        },
      }}
    >
      {/* Top Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          p: 2,
        }}
      >
        {open && (
          <Box display="flex" alignItems="center" gap={1}>
            <SchoolIcon sx={{ color: "#1976d2", fontSize: 28 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{ fontWeight: 800, color: "#1976d2", letterSpacing: "-0.5px" }}
            >
              MarkSync
            </Typography>
          </Box>
        )}
        <IconButton onClick={toggleDrawer} size="small">
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* Role Badge */}
      {open && role && (
        <Box sx={{ px: 2, py: 1.5, bgcolor: "#f8fafc" }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            LOGGED IN AS
          </Typography>
          <Typography variant="body2" fontWeight={700} color="primary.main">
            {role.toUpperCase()}
          </Typography>
        </Box>
      )}

      <Divider />

      {/* Menu */}
      <List sx={{ mt: 1, px: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.route;
          return (
            <Tooltip
              key={item.text}
              title={!open ? item.text : ""}
              placement="right"
              arrow
            >
              <ListItemButton
                onClick={() => router.push(item.route)}
                sx={{
                  px: 2,
                  py: 1.2,
                  borderRadius: 1.5,
                  mb: 0.5,
                  bgcolor: isActive ? "#e3f2fd" : "transparent",
                  color: isActive ? "#1976d2" : "text.primary",
                  "&:hover": { bgcolor: isActive ? "#bbdefb" : "#f1f5f9" },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#1976d2" : "#64748b",
                    minWidth: 36,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 700 : 500,
                      fontSize: "0.9rem",
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      {/* Logout at Bottom */}
      <Box sx={{ p: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={() => signOut({ callbackUrl: "/login" })}
          startIcon={<FiLogOut />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            justifyContent: open ? "flex-start" : "center",
            px: open ? 2 : 1,
          }}
        >
          {open && "Sign Out"}
        </Button>
      </Box>
    </Drawer>
  );
}
