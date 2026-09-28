import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Select from "../../components/Select";
import type { Option } from "../../../types/designation";
interface DesignationFiltersProps {
  department: string;
  level: string;
  grade: string;
  status: string;
  fromDate: string;
  toDate: string;
  departmentOptions: Option[];
  designationLevelOptions: Option[];
  gradeOptions: Option[];
  statusOptions: Option[];
  activeCount: number;
  inactiveCount: number;
  totalCount: number;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  mode: "date" | "beginning";
  onModeChange: (value: "date" | "beginning") => void;
  sortBy: "name" | "code" | "level";
  sortDirection: "asc" | "desc";
  onSortByChange: (value: "name" | "code" | "level") => void;
  onSortDirectionChange: (value: "asc" | "desc") => void;
}
const getToday = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const DesignationFilters = ({
  department,
  level,
  grade,
  status,
  fromDate,
  toDate,
  departmentOptions,
  designationLevelOptions,
  gradeOptions,
  statusOptions,
  activeCount,
  inactiveCount,
  totalCount,
  searchQuery,
  onSearchQueryChange,
  onDepartmentChange,
  onLevelChange,
  onGradeChange,
  onStatusChange,
  onFromDateChange,
  onToDateChange,
  onSearch,
  onReset,
  mode,
  onModeChange,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
}: DesignationFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [dateError, setDateError] = useState("");
  const today = getToday();
  useEffect(() => {
    if (fromDate && fromDate > today) {
      setDateError("From Date cannot be a future date");
    } else if (toDate && toDate > today) {
      setDateError("To Date cannot be a future date");
    } else if (fromDate && toDate && fromDate > toDate) {
      setDateError("From Date cannot be greater than To Date");
    } else {
      setDateError("");
    }
  }, [fromDate, toDate, today]);
  const handleFromDate = (value: string) => {
    if (value > today) {
      setDateError("From Date cannot be a future date");
      return;
    } // Date change is an event only; the parent filters the already-loaded data locally.
    onFromDateChange(value);
  };
  const handleToDate = (value: string) => {
    if (value > today) {
      setDateError("To Date cannot be a future date");
      return;
    } // Date change is an event only; the parent filters the already-loaded data locally.
    onToDateChange(value);
  };
  const handleSearch = () => {
    if (fromDate && toDate && fromDate > toDate) {
      setDateError("From Date cannot be greater than To Date");
      return;
    }
    if (fromDate > today || toDate > today) {
      setDateError("Future dates are not allowed");
      return;
    }
    setShowFilters(false); 
    onSearch();
  };
  const handleWildSearch = () => {
    const value = searchQuery.trim();
    if (!value) {
      return;
    }
    onSearch();
  };
  const optionWithAll = (options: Option[]) => [
    { label: "All", value: "" },
    ...options,
  ];
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: "14px",
        border: "1px solid #E8E0D8",
        background: "linear-gradient(145deg, #FFFFFF 0%, #FAF8F6 100%)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <TextField
              fullWidth
              placeholder="Search by code, name, category..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              size="small"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "#F8F6F4",
                  transition: "all 0.3s ease",
                  "& fieldset": {
                    borderColor: "#E8E0D8",
                    borderWidth: "1px",
                  },
                  "&:hover": {
                    backgroundColor: "#FFFFFF",
                    "& fieldset": {
                      borderColor: "#C47A42",
                    },
                  },
                  "&.Mui-focused": {
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 0 0 4px rgba(196,122,66,0.08)",
                    "& fieldset": {
                      borderColor: "#C47A42",
                      borderWidth: "2px",
                    },
                  },
                },
                "& .MuiInputBase-input": {
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#2D2A27",
                  padding: "10px 14px",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#9A8B7E",
                  fontWeight: 400,
                },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      {searchQuery && (
                        <IconButton
                          onClick={() => onSearchQueryChange("")}
                          size="small"
                          sx={{
                            color: "#9A8B7E",
                            "&:hover": {
                              color: "#C47A42",
                              backgroundColor: "transparent",
                            },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        onClick={handleWildSearch}
                        size="small"
                        sx={{
                          color: "#C47A42",
                          ml: 0.5,
                          "&:hover": {
                            color: "#A65320",
                            backgroundColor: "rgba(196,122,66,0.08)",
                          },
                        }}
                      >
                        <SearchIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box sx={{ mb: 1.5 }}>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    sx={{
                      mb: 0.45,
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#6B5B4E",
                    }}
                  >
                    From Date
                  </Typography>
                  <TextField
                    type="date"
                    value={fromDate}
                    onChange={(event) => handleFromDate(event.target.value)}
                    slotProps={{
                      htmlInput: { max: today },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon
                              sx={{ color: "#9A8B7E", fontSize: 16 }}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#FFFFFF",
                        "& fieldset": {
                          borderColor: "#E8E0D8",
                        },
                        "&:hover fieldset": {
                          borderColor: "#C47A42",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#C47A42",
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#2D2A27",
                        padding: "8px 12px",
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    sx={{
                      mb: 0.45,
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#6B5B4E",
                    }}
                  >
                    To Date
                  </Typography>
                  <TextField
                    type="date"
                    value={toDate}
                    onChange={(event) => handleToDate(event.target.value)}
                    slotProps={{
                      htmlInput: {
                        max: today,
                        min: fromDate || undefined,
                      },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon
                              sx={{ color: "#9A8B7E", fontSize: 16 }}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#FFFFFF",
                        "& fieldset": {
                          borderColor: "#E8E0D8",
                        },
                        "&:hover fieldset": {
                          borderColor: "#C47A42",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#C47A42",
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#2D2A27",
                        padding: "8px 12px",
                      },
                    }}
                  />
                </Grid>
              </Grid>
              {dateError && (
                <Typography
                  sx={{
                    mt: 0.8,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#D32F2F",
                  }}
                >
                  {dateError}
                </Typography>
              )}
            </Box>
            {showFilters && (
              <Box
                sx={{
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: "1px solid #F0EBE6",
                }}
              >
                <Typography
                  sx={{
                    mb: 1,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#6B5B4E",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  Additional Filters
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Select
                      label="Department"
                      options={optionWithAll(departmentOptions)}
                      value={department}
                      onChange={onDepartmentChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Select
                      label="Designation Level"
                      options={optionWithAll(designationLevelOptions)}
                      value={level}
                      onChange={onLevelChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Select
                      label="Grade"
                      options={optionWithAll(gradeOptions)}
                      value={grade}
                      onChange={onGradeChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Select
                      label="Status"
                      options={optionWithAll(statusOptions)}
                      value={status}
                      onChange={onStatusChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Select
                      label="Sort By"
                      options={[
                        { label: "Name", value: "name" },
                        { label: "Code", value: "code" },
                        { label: "Level", value: "level" },
                      ]}
                      value={sortBy}
                      onChange={(value) =>
                        onSortByChange(value as "name" | "code" | "level")
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Select
                      label="Sort Direction"
                      options={[
                        { label: "Ascending", value: "asc" },
                        { label: "Descending", value: "desc" },
                      ]}
                      value={sortDirection}
                      onChange={(value) =>
                        onSortDirectionChange(value as "asc" | "desc")
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={!!dateError}
                sx={{
                  px: 3,
                  height: 36,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #C47A42 0%, #A65320 100%)",
                  boxShadow: "0 4px 14px rgba(166,83,32,0.25)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #B46A32 0%, #964A1A 100%)",
                    boxShadow: "0 6px 20px rgba(166,83,32,0.35)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.25s ease",
                }}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
                onClick={() => setShowFilters((previous) => !previous)}
                sx={{
                  height: 36,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#4E5D69",
                  borderColor: "#D8CFC6",
                  "&:hover": {
                    borderColor: "#C47A42",
                    color: "#C47A42",
                    backgroundColor: "rgba(196,122,66,0.04)",
                  },
                }}
              >
                {showFilters ? "Hide Filters" : "More Filters"}
              </Button>
              <Button
                variant="text"
                onClick={onReset}
                sx={{
                  height: 36,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#89524E",
                  "&:hover": {
                    backgroundColor: "rgba(137,82,78,0.06)",
                  },
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Box
              sx={{
                mb: 1.1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#6B5B4E",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Status Overview
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 0.35,
                  p: 0.35,
                  borderRadius: "11px",
                  backgroundColor: "#F3F6FA",
                  border: "1px solid #DDE5ED",
                  boxShadow: "inset 0 1px 2px rgba(39,70,111,0.06)",
                }}
              >
                <Button
                  size="small"
                  onClick={() => onModeChange("date")}
                  sx={{
                    minWidth: 0,
                    px: 1.15,
                    height: 28,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontSize: 10,
                    fontWeight: 800,
                    color: mode === "date" ? "#FFFFFF" : "#536273",
                    backgroundColor:
                      mode === "date" ? "#27466F" : "transparent",
                    boxShadow:
                      mode === "date"
                        ? "0 3px 9px rgba(39,70,111,0.22)"
                        : "none",
                    "&:hover": {
                      backgroundColor: mode === "date" ? "#27466F" : "#E8EEF4",
                    },
                  }}
                >
                  As Per Date Filter
                </Button>
                <Button
                  size="small"
                  onClick={() => onModeChange("beginning")}
                  sx={{
                    minWidth: 0,
                    px: 1.15,
                    height: 28,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontSize: 10,
                    fontWeight: 800,
                    color: mode === "beginning" ? "#FFFFFF" : "#536273",
                    backgroundColor:
                      mode === "beginning" ? "#27466F" : "transparent",
                    boxShadow:
                      mode === "beginning"
                        ? "0 3px 9px rgba(39,70,111,0.22)"
                        : "none",
                    "&:hover": {
                      backgroundColor:
                        mode === "beginning" ? "#27466F" : "#E8EEF4",
                    },
                  }}
                >
                  Since Beginning
                </Button>
              </Box>
            </Box>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 4 }}>
                <PremiumTile
                  title="Total"
                  value={totalCount}
                  type="total"
                  selected={status === ""}
                  onClick={() => onStatusChange("")}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <PremiumTile
                  title="Active"
                  value={activeCount}
                  type="active"
                  selected={status === "true"}
                  onClick={() => onStatusChange("true")}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <PremiumTile
                  title="Inactive"
                  value={inactiveCount}
                  type="inactive"
                  selected={status === "false"}
                  onClick={() => onStatusChange("false")}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
interface PremiumTileProps {
  title: string;
  value: number;
  type: "active" | "inactive" | "total";
  selected?: boolean;
  onClick?: () => void;
}
const PremiumTile = ({
  title,
  value,
  type,
  selected = false,
  onClick,
}: PremiumTileProps) => {
  const styles = {
    active: {
      gradient: "#4F7354",
      border: "#FFFFFF",
      number: "#FFFFFF",
      title: "#EAF2EA",
      icon: "✓",
    },
    inactive: {
      gradient: "#C62828",
      border: "#FFFFFF",
      number: "#FFFFFF",
      title: "#F7E9E7",
      icon: "–",
    },
    total: {
      gradient: "#536F88",
      border: "#FFFFFF",
      number: "#FFFFFF",
      title: "#E8EFF4",
      icon: "◆",
    },
  }[type];
  return (
    <Box
      onClick={onClick}
      sx={{
        position: "relative",
        p: 1.8,
        borderRadius: "10px",
        background: styles.gradient,
        cursor: "pointer",
        boxShadow: selected
          ? `0 6px 24px rgba(0,0,0,0.15)`
          : "0 4px 12px rgba(0,0,0,0.06)",
        transform: selected ? "translateY(-2px)" : "none",
        border: selected
          ? `2px solid ${styles.border}`
          : "2px solid transparent",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.15)",
        },
      }}
    >
      {selected && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 0 8px rgba(255,255,255,0.4)",
          }}
        />
      )}
      <Box
        sx={{
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          backgroundColor: "rgba(255,255,255,0.12)",
          color: "#FFFFFF",
          fontSize: 12,
          fontWeight: 900,
          mb: 1,
        }}
      >
        {styles.icon}
      </Box>
      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 800,
          color: styles.number,
          lineHeight: 1.1,
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          mt: 0.5,
          fontSize: 9,
          fontWeight: 700,
          color: styles.title,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          lineHeight: 1.2,
          opacity: 0.9,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};
export default DesignationFilters;
