import { Box, Drawer, IconButton } from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import CloseIcon from "@mui/icons-material/Close";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onDesignationClick?: () => void;
  onDashboardClick?: () => void;
}

const DRAWER_WIDTH = 250;

const Sidebar = ({
  open,
  onClose,
  onDesignationClick,
  onDashboardClick,
}: SidebarProps) => {
  const handleDashboardClick = () => {
    onDashboardClick?.();
    onClose();
  };

  const handleDesignationClick = () => {
    onDesignationClick?.();
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          borderRight: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Box
          sx={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#123B63",
          }}
        >
          Menu
        </Box>

        <IconButton
          onClick={onClose}
          aria-label="close navigation"
          size="small"
          sx={{
            color: "#64748B",
            "&:hover": {
              backgroundColor: "#F1F5F9",
              color: "#123B63",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box
        component="nav"
        sx={{
          px: 1.25,
          py: 2,
        }}
      >
        <Box
          component="div"
          onClick={handleDashboardClick}
          sx={{
            minHeight: 46,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 1.5,
            mb: 0.75,
            borderRadius: "8px",
            cursor: "pointer",
            color: "#475569",
            fontWeight: 500,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#F1F5F9",
              color: "#123B63",
            },
          }}
        >
          <DashboardOutlinedIcon sx={{ fontSize: 21 }} />

          <Box
            component="span"
            sx={{
              fontSize: "14px",
              lineHeight: 1,
            }}
          >
            Dashboard
          </Box>
        </Box>

        <Box
          component="div"
          onClick={handleDesignationClick}
          sx={{
            minHeight: 46,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 1.5,
            mb: 0.75,
            borderRadius: "8px",
            cursor: "pointer",
            color: "#475569",
            fontWeight: 500,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#F1F5F9",
              color: "#123B63",
            },
          }}
        >
          <BusinessCenterOutlinedIcon sx={{ fontSize: 21 }} />

          <Box
            component="span"
            sx={{
              fontSize: "14px",
              lineHeight: 1,
            }}
          >
            Designation Master
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
