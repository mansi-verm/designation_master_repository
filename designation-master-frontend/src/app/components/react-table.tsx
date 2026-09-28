import { useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

interface ReusableTableProps<T extends Record<string, any>> {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  loading: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => Promise<void> | void;
}

const displayValue = (value: unknown) =>
  value === null || value === undefined || String(value).trim() === ""
    ? "NA"
    : String(value);

const ReusableTable = <T extends Record<string, any>>({
  data,
  columns,
  loading,
  onEdit,
  onDelete,
}: ReusableTableProps<T>) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (row: T) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRow || !onDelete) return;

    try {
      setDeleting(true);
      await onDelete(selectedRow);
      setDeleteOpen(false);
      setSelectedRow(null);
    } finally {
      setDeleting(false);
    }
  };

  const table = useMaterialReactTable<T>({
    columns,
    data,

    state: {
      isLoading: loading,
    },

    enableRowActions: Boolean(onEdit || onDelete),
    positionActionsColumn: "first",

    enablePagination: true,
    enableSorting: true,

    enableColumnFilters: false,
    enableColumnResizing: false,

    enableGlobalFilter: true,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: true,

    layoutMode: "grid-no-grow",

    positionGlobalFilter: "left",

    initialState: {
      showGlobalFilter: false,
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },

    renderRowActions: ({ row }) => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
          width: "100%",
        }}
      >
        {onEdit && (
          <Tooltip title="Edit" arrow>
            <IconButton
              size="small"
              onClick={() => onEdit(row.original)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: "7px",
                color: "#536F88",
                backgroundColor: "#F5F7F8",
                border: "1px solid #DDE4E8",
                "&:hover": {
                  backgroundColor: "#EAF0F4",
                },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        )}

        {onDelete && (
          <Tooltip
            title={
              row.original.status ? "Delete designation" : "Already deleted"
            }
            arrow
          >
            <span>
              <IconButton
                size="small"
                disabled={!row.original.status}
                onClick={() => handleDeleteClick(row.original)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "7px",
                  color: "#89524E",
                  backgroundColor: "#F9F0EF",
                  border: "1px solid #E5D1CF",
                  "&:hover": {
                    backgroundColor: "#F3E4E2",
                  },
                  "&.Mui-disabled": {
                    opacity: 0.45,
                  },
                }}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
    ),

    muiTablePaperProps: {
      elevation: 0,
      sx: {
        width: "100%",
        height: "100%",
        minHeight: 0,
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
      },
    },

    muiTopToolbarProps: {
      sx: {
        minHeight: 48,
        height: 48,
        px: 1.5,
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E3E8EC",

        "& .MuiBox-root": {
          minHeight: 0,
        },

        "& .MuiIconButton-root": {
          width: 32,
          height: 32,
          borderRadius: "7px",
          color: "#536F88",
        },

        "& .MuiIconButton-root:hover": {
          backgroundColor: "#EEF3F6",
        },

        "& .MuiInputBase-root": {
          height: 32,
          minHeight: 32,
          fontSize: 11,
          borderRadius: "7px",
        },

        "& .MuiInputBase-input": {
          fontSize: 11,
        },

        "& .MuiSvgIcon-root": {
          fontSize: 18,
        },

        "& [aria-label='Show/Hide filters']": {
          display: "none",
        },

        "& [aria-label='Show/Hide columns']": {
          display: "none",
        },

        "& [aria-label='Toggle density']": {
          display: "none",
        },

        "& [aria-label='Toggle full screen']": {
          display: "inline-flex",
        },
      },
    },

    muiTableHeadProps: {
      sx: {
        position: "sticky",
        top: 0,
        zIndex: 5,
      },
    },

    muiTableHeadCellProps: {
      sx: {
        background: "linear-gradient(180deg, #314B63 0%, #253D53 100%)",
        color: "#FFFFFF",
        fontWeight: 800,
        fontSize: 10,
        letterSpacing: "0.25px",
        whiteSpace: "nowrap",
        height: 38,
        minHeight: 38,
        py: 0.7,
        px: 1,
        textAlign: "center",
        verticalAlign: "middle",
        borderRight: "1px solid rgba(255,255,255,0.12)",
        borderBottom: "none",
        boxSizing: "border-box",

        "& .MuiTableSortLabel-root": {
          color: "#FFFFFF",
          fontWeight: 800,
          justifyContent: "center",
          width: "100%",
        },

        "& .MuiTableSortLabel-root:hover": {
          color: "#FFFFFF",
        },

        "& .MuiTableSortLabel-icon": {
          color: "#FFFFFF !important",
        },

        "& .Mui-TableHeadCell-Content": {
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        },

        "& .Mui-TableHeadCell-Content-Labels": {
          justifyContent: "center",
          width: "100%",
        },

        "& .Mui-TableHeadCell-Content-Actions": {
          display: "none",
        },
      },
    },

    muiTableBodyCellProps: {
      sx: {
        height: 40,
        minHeight: 40,
        py: 0.7,
        px: 1,
        fontSize: 10.5,
        color: "#596873",
        textAlign: "center",
        verticalAlign: "middle",
        borderBottom: "1px solid #ECEFF1",
        whiteSpace: "nowrap",
        overflow: "hidden",
        boxSizing: "border-box",

        "& > *": {
          marginLeft: "auto",
          marginRight: "auto",
        },
      },
    },

    muiTableBodyRowProps: {
      sx: {
        "&:nth-of-type(even)": {
          backgroundColor: "#FAFBFC",
        },

        "&:hover": {
          backgroundColor: "#F1F5F8 !important",
        },
      },
    },

    muiTableContainerProps: {
      sx: {
        width: "100%",
        flex: "1 1 auto",
        minHeight: 0,
        overflowX: "auto",
        overflowY: "auto",

        "& table": {
          width: "100%",
          tableLayout: "fixed",
        },

        "&::-webkit-scrollbar": {
          width: 7,
          height: 7,
        },

        "&::-webkit-scrollbar-thumb": {
          borderRadius: 10,
          backgroundColor: "#B9C4CD",
        },

        "&::-webkit-scrollbar-track": {
          backgroundColor: "#F5F7F9",
        },
      },
    },

    muiBottomToolbarProps: {
      sx: {
        minHeight: 48,
        height: 48,
        flexShrink: 0,
        px: 1.5,
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #DDE4E9",
        boxShadow: "0 -2px 8px rgba(30,45,60,0.05)",
        position: "relative",
        zIndex: 10,

        "& .MuiTypography-root": {
          fontSize: 10.5,
          color: "#647482",
        },

        "& .MuiInputBase-root": {
          fontSize: 10.5,
          height: 30,
          minHeight: 30,
        },

        "& .MuiInputBase-input": {
          fontSize: 10.5,
        },

        "& .MuiIconButton-root": {
          width: 30,
          height: 30,
          borderRadius: "7px",
        },

        "& .MuiTablePagination-selectLabel": {
          fontSize: 10.5,
        },

        "& .MuiTablePagination-displayedRows": {
          fontSize: 10.5,
        },
      },
    },

    muiPaginationProps: {
      color: "primary",
      shape: "rounded",
      showFirstButton: true,
      showLastButton: true,
      size: "small",
    },
  });

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderRadius: "10px",
          backgroundColor: "#FFFFFF",
        }}
      >
        <MaterialReactTable table={table} />
      </Box>

      {onDelete && (
        <Dialog
          open={deleteOpen}
          onClose={() => !deleting && setDeleteOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Delete Designation
          </DialogTitle>

          <DialogContent
            sx={{
              color: "#526173",
              fontSize: 13.5,
            }}
          >
            Are you sure you want to delete this designation?
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              pb: 2,
            }}
          >
            <Button
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
              sx={{
                textTransform: "none",
              }}
            >
              Cancel
            </Button>

            <Button
              color="error"
              variant="contained"
              onClick={handleConfirmDelete}
              disabled={deleting}
              sx={{
                textTransform: "none",
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default ReusableTable;

export const TableText = ({
  value,
  maxWidth = 170,
  align = "center",
  color = "#596873",
  fontWeight = 550,
}: {
  value?: unknown;
  maxWidth?: number;
  align?: "left" | "center" | "right";
  color?: string;
  fontWeight?: number;
}) => (
  <Typography
    component="div"
    sx={{
      width: "100%",
      maxWidth,
      mx: align === "center" ? "auto" : 0,
      fontSize: 10.5,
      fontWeight,
      color,
      textAlign: align,
      lineHeight: 1.3,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      boxSizing: "border-box",
    }}
  >
    {displayValue(value)}
  </Typography>
);

export const StatusChip = ({ value }: { value: boolean }) => (
  <Box
    sx={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Chip
      label={value ? "ACTIVE" : "INACTIVE"}
      size="small"
      sx={{
        height: 24,
        minWidth: 72,
        borderRadius: "6px",
        fontWeight: 800,
        fontSize: 8.5,
        letterSpacing: ".45px",
        color: "#FFFFFF",
        backgroundColor: value ? "#5F8063" : "#7C382F",
        border: `1px solid ${value ? "#527256" : "#89534D"}`,
      }}
    />
  </Box>
);
