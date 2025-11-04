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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useRouter } from "next/navigation";

export const drawerWidth = 200;
export const collapsedWidth = 72;

export default function Sidebar({
  onToggle,
}: {
  onToggle?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const toggleDrawer = () => {
    setOpen((prev) => {
      const newOpen = !prev;
      onToggle?.(newOpen);
      return newOpen;
    });
  };

  const menuItems = [
    { text: "Home", icon: <HomeIcon />, route: "/classes" },
    { text: "Profile", icon: <AccountCircleIcon />, route: "/profile" },
  ];

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
          borderRight: "1px solid #e0e0e0",
          borderRadius: 0,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "flex-end" : "center",
          p: 1,
        }}
      >
        <Typography
          variant="h6"
          noWrap
          sx={{ flexGrow: 1, mr: 2, color: "#1976d2" }}
        >
          marksync
        </Typography>
        <IconButton onClick={toggleDrawer}>
          {open ? (
            <ChevronLeftIcon sx={{ justifyContent: "flex-end" }} />
          ) : (
            <MenuIcon />
          )}
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ mt: 1 }}>
        {menuItems.map((item) => (
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
                borderRadius: 0,
                "&:hover": { bgcolor: "#f0f4ff" },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#1976d2",
                  minWidth: 40,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    color: "text.primary",
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
}
