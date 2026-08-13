"use client";

import { ReactNode, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AppRegistrationOutlinedIcon from "@mui/icons-material/AppRegistrationOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  roles: ("ADMIN" | "INSTRUCTOR" | "STUDENT")[];
}

const NAV_ITEMS: NavItem[] = [
  // Admin Navigation
  {
    label: "Admin Dashboard",
    path: "/admin/dashboard",
    icon: <DashboardOutlinedIcon />,
    roles: ["ADMIN"],
  },
  {
    label: "Semesters & Courses",
    path: "/admin/semesters",
    icon: <SchoolOutlinedIcon />,
    roles: ["ADMIN"],
  },
  {
    label: "User Roles & Permissions",
    path: "/admin/users",
    icon: <PeopleOutlinedIcon />,
    roles: ["ADMIN"],
  },
  {
    label: "Attendance Analytics",
    path: "/admin/reports",
    icon: <AssessmentOutlinedIcon />,
    roles: ["ADMIN"],
  },

  // Instructor Navigation
  {
    label: "My Taught Courses",
    path: "/instructor/courses",
    icon: <ClassOutlinedIcon />,
    roles: ["INSTRUCTOR"],
  },

  // Student Navigation
  {
    label: "My Dashboard",
    path: "/home",
    icon: <DashboardOutlinedIcon />,
    roles: ["STUDENT"],
  },
  {
    label: "Course Registration",
    path: "/home/register-courses",
    icon: <AppRegistrationOutlinedIcon />,
    roles: ["STUDENT"],
  },

  // Shared Navigation
  {
    label: "My Profile",
    path: "/profile",
    icon: <PersonOutlinedIcon />,
    roles: ["ADMIN", "INSTRUCTOR", "STUDENT"],
  },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const role = (session?.user?.role as "ADMIN" | "INSTRUCTOR" | "STUDENT") || "STUDENT";
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userEmail = session?.user?.email || "";

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    signOut({ callbackUrl: "/login" });
  };

  const visibleNavItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#FFFFFF" }}>
      {/* Brand Logo */}
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            bgcolor: "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SchoolOutlinedIcon sx={{ fontSize: 24, color: "#6366F1" }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ lineHeight: 1.2 }}>
            MarkSync
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Attendance Platform
          </Typography>
        </Box>
      </Box>

      {/* Role Chip Banner */}
      <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
          LOGGED IN AS
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={700} color="#0F172A" noWrap sx={{ maxWidth: 140 }}>
            {userName}
          </Typography>
          <Chip
            label={role}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: "0.7rem",
              bgcolor:
                role === "ADMIN"
                  ? "#FFF1F2"
                  : role === "INSTRUCTOR"
                  ? "#EEF2FF"
                  : "#ECFDF5",
              color:
                role === "ADMIN"
                  ? "#E11D48"
                  : role === "INSTRUCTOR"
                  ? "#4F46E5"
                  : "#059669",
              border: "1px solid",
              borderColor:
                role === "ADMIN"
                  ? "#FECDD3"
                  : role === "INSTRUCTOR"
                  ? "#E0E7FF"
                  : "#A7F3D0",
            }}
          />
        </Box>
      </Box>

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/admin/dashboard" && item.path !== "/home" && item.path !== "/instructor/courses" && pathname.startsWith(item.path));

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  router.push(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: "10px",
                  bgcolor: isActive ? "#EEF2FF" : "transparent",
                  color: isActive ? "#4F46E5" : "#475569",
                  "&:hover": {
                    bgcolor: isActive ? "#EEF2FF" : "#F8FAFC",
                    color: isActive ? "#4F46E5" : "#1E293B",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#4F46E5" : "#64748B",
                    minWidth: 38,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: isActive ? 700 : 600,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Drawer Bottom Logout Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutOutlinedIcon />}
          onClick={handleLogout}
          sx={{
            borderRadius: "10px",
            borderColor: "#FECDD3",
            bgcolor: "#FFF1F2",
            color: "#E11D48",
            "&:hover": {
              bgcolor: "#FFE4E6",
              borderColor: "#FDA4AF",
            },
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F8FAFC" }}>
      {/* Top Navbar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          color: "#0F172A",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 0.5 }}>
          <Box display="flex" alignItems="center" gap={1}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography variant="subtitle1" fontWeight={700} color="#0F172A" sx={{ display: { xs: "none", sm: "block" } }}>
              {role === "ADMIN"
                ? "Administrator Portal"
                : role === "INSTRUCTOR"
                ? "Instructor Workspace"
                : "Student Dashboard"}
            </Typography>
          </Box>

          {/* User Control Right Section */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <Chip
              label={role}
              size="small"
              sx={{
                fontWeight: 700,
                display: { xs: "none", sm: "inline-flex" },
                bgcolor:
                  role === "ADMIN"
                    ? "#FFF1F2"
                    : role === "INSTRUCTOR"
                    ? "#EEF2FF"
                    : "#ECFDF5",
                color:
                  role === "ADMIN"
                    ? "#E11D48"
                    : role === "INSTRUCTOR"
                    ? "#4F46E5"
                    : "#059669",
                border: "1px solid",
                borderColor:
                  role === "ADMIN"
                    ? "#FECDD3"
                    : role === "INSTRUCTOR"
                    ? "#E0E7FF"
                    : "#A7F3D0",
              }}
            />

            <Box
              onClick={handleMenuOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                cursor: "pointer",
                p: 0.5,
                px: 1,
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                bgcolor: "#F8FAFC",
                "&:hover": { bgcolor: "#F1F5F9" },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#6366F1",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "left" }}>
                <Typography variant="body2" fontWeight={700} color="#0F172A" lineHeight={1.2}>
                  {userName}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {userEmail}
                </Typography>
              </Box>
            </Box>

            {/* Topbar Direct Logout Button */}
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LogoutOutlinedIcon />}
              onClick={handleLogout}
              sx={{
                borderRadius: "8px",
                borderColor: "#FECDD3",
                bgcolor: "#FFF1F2",
                color: "#E11D48",
                px: 1.5,
                py: 0.75,
                fontSize: "0.85rem",
                "&:hover": {
                  bgcolor: "#FFE4E6",
                  borderColor: "#FDA4AF",
                },
              }}
            >
              Logout
            </Button>
          </Box>

          {/* User Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: "12px",
                minWidth: 180,
                mt: 1,
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                border: "1px solid #E2E8F0",
              },
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); router.push("/profile"); }}>
              <ListItemIcon>
                <PersonOutlinedIcon fontSize="small" sx={{ color: "#6366F1" }} />
              </ListItemIcon>
              <ListItemText primary="My Profile" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 600 }} />
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout} sx={{ color: "#E11D48" }}>
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" sx={{ color: "#E11D48" }} />
              </ListItemIcon>
              <ListItemText primary="Sign Out" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 700 }} />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              borderRight: "1px solid #E2E8F0",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              borderRight: "1px solid #E2E8F0",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: "64px", // height of AppBar
          p: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
