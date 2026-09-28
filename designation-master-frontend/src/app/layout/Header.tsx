import { useState } from "react";
import type { MouseEvent } from "react";

import {
  AppBar,
  Badge,
  Box,
  IconButton,
  Popover,
  Toolbar,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";


import Notification from "../components/Notification";

import { clearAuth, getAuthUser } from "../../auth/auth";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const [notificationAnchor, setNotificationAnchor] =
    useState<HTMLElement | null>(null);
  const [notificationRefreshKey, setNotificationRefreshKey] = useState(0);

  const notificationOpen = Boolean(notificationAnchor);

  const authUser = getAuthUser();

  const handleNotificationClick = (event: MouseEvent<HTMLElement>) => {
    setNotificationRefreshKey((previous) => previous + 1);
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    clearAuth();

    // No redirect
    window.location.reload();
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "#FFFFFF",
        color: "#1F2933",
        borderBottom: "1px solid #CBD5DF",
        boxShadow: "0 2px 10px rgba(11, 41, 66, 0.06)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: "64px !important",
          px: {
            xs: 1.5,
            sm: 2.5,
            md: 3,
          },
        }}
      >
        {/* MENU */}

        <IconButton
          onClick={onMenuClick}
          edge="start"
          aria-label="open navigation"
          sx={{
            width: 38,
            height: 38,
            mr: 1.75,
            color: "#123B63",
            border: "1px solid #D5DEE7",
            borderRadius: "6px",
            backgroundColor: "#F7F9FB",

            "&:hover": {
              backgroundColor: "#E9EEF3",
              borderColor: "#B8C6D3",
              color: "#0B2942",
            },
          }}
        >
          <MenuIcon sx={{ fontSize: 21 }} />
        </IconButton>

        {/* LOGO */}

        <Box
          component="img"
          src="/DreamSol@2x.png"
          alt="DreamSol Innovation Business Processes"
          sx={{
            display: "block",
            height: {
              xs: 34,
              sm: 40,
            },
            width: "auto",
            maxWidth: {
              xs: "180px",
              sm: "280px",
              md: "340px",
            },
            objectFit: "contain",
            objectPosition: "left center",
            flexShrink: 1,
          }}
        />

        {/* SPACER */}

        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
          }}
        />

        {/* USER INFO */}

        {authUser && (
          <Box
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
              textAlign: "right",
              mr: 1.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: "#123B63",
                lineHeight: 1.2,
              }}
            >
              {authUser.role}
            </Typography>
          </Box>
        )}

        {/* LOGIN / LOGOUT */}

        {authUser ? (
          <IconButton
            onClick={handleLogout}
            aria-label="logout"
            title="Logout"
            sx={{
              width: 42,
              height: 42,
              mr: 1,
              color: "#B42318",
              border: "1px solid #F1C7C3",
              borderRadius: "8px",
              backgroundColor: "#FFF7F6",

              "&:hover": {
                backgroundColor: "#FDECEA",
                borderColor: "#E5A9A3",
                color: "#8E1B13",
              },
            }}
          >
            <LogoutOutlinedIcon
              sx={{
                fontSize: 23,
              }}
            />
          </IconButton>
        ) : (
          <IconButton
            onClick={handleLogin}
            aria-label="login"
            title="Login"
            sx={{
              width: 42,
              height: 42,
              mr: 1,
              color: "#123B63",
              border: "1px solid #D5DEE7",
              borderRadius: "8px",
              backgroundColor: "#F7F9FB",

              "&:hover": {
                backgroundColor: "#E9EEF3",
                borderColor: "#B8C6D3",
                color: "#0B2942",
              },
            }}
          >
            <LoginOutlinedIcon
              sx={{
                fontSize: 23,
              }}
            />
          </IconButton>
        )}

        {/* NOTIFICATION BUTTON */}

        <IconButton
          onClick={handleNotificationClick}
          aria-label="notifications"
          aria-haspopup="true"
          aria-expanded={notificationOpen ? "true" : undefined}
          sx={{
            width: 42,
            height: 42,
            color: "#123B63",
            border: "1px solid #D5DEE7",
            borderRadius: "8px",
            backgroundColor: "#F7F9FB",

            "&:hover": {
              backgroundColor: "#E9EEF3",
              borderColor: "#B8C6D3",
              color: "#0B2942",
            },
          }}
        >
          <Badge
            color="error"
            variant="dot"
            invisible={false}
            sx={{
              "& .MuiBadge-badge": {
                top: 3,
                right: 3,
              },
            }}
          >
            <NotificationsNoneIcon
              sx={{
                fontSize: 24,
              }}
            />
          </Badge>
        </IconButton>

        {/* NOTIFICATION POPOVER */}

        <Popover
          open={notificationOpen}
          anchorEl={notificationAnchor}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          slotProps={{
            paper: {
              sx: {
                mt: 1.2,
                borderRadius: "12px",
                boxShadow: "0 12px 35px rgba(11, 41, 66, 0.18)",
                overflow: "visible",
              },
            },
          }}
        >
          <Notification
            key={notificationRefreshKey}
            onClosePanel={handleNotificationClose}
          />
        </Popover>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
