import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import BarChartIcon from "@mui/icons-material/BarChart";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import TimelineIcon from "@mui/icons-material/Timeline";
import SpeedIcon from "@mui/icons-material/Speed";
import TableChartIcon from "@mui/icons-material/TableChart";
import CloseIcon from "@mui/icons-material/Close";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { Gauge } from "@mui/x-charts/Gauge";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { MRT_ColumnDef } from "material-react-table";
import DesignationTable, { TableText } from "../../components/react-table";
import {
  getDesignationAnalytics,
  getDesignationCount,
  getDesignations,
  getDropdowns,
  getDesignationExcelHeaders, // 👈 new
  type DesignationAnalytics,
} from "../../../api/DesignationApi";

interface DashboardFilters {
  fromDate: string;
  toDate: string;
  department: string;
  level: string;
  grade: string;
  status: string;
}

type ChartLibrary = "react" | "amchart" | "apex";
type ViewMode = "graph" | "table";
type CardType =
  | "gauge"
  | "status"
  | "grade"
  | "date"
  | "stacked"
  | "summary"
  | "department";

interface ChartPoint {
  label: string;
  value: number;
}

interface DashboardDesignation {
  [key: string]: unknown;
  id?: number;
  designationCode?: string;
  designationName?: string;
  shortName?: string;
  departmentId?: number;
  departmentName?: string;
  designationLevel?: number;
  parentDesignationId?: number | null;
  jobCategory?: string;
  employmentType?: string | string[];
  grade?: string;
  minExperience?: number;
  maxExperience?: number;
  description?: string;
  skills?: unknown[] | string;
  branchIds?: unknown[] | string;
  status?: boolean;
  attachments?: unknown;
  remarks?: string;
  createdAt?: string;
}

interface ChartCardProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  viewMode: ViewMode;
  onViewChange: (value: ViewMode) => void;
  children: ReactNode;
}

const COLORS = {
  primary: "#123B63",
  secondary: "#1D70A2",
  active: "#4F7354",
  inactive: "#C62828",
  total: "#536F88",
  warning: "#F9A825",
  info: "#1565C0",
  neutral: "#829AB1",
};

const CHART_PALETTE = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.active,
  COLORS.warning,
  COLORS.inactive,
];

const CHART_HEIGHT = 340;
const CHART_BOX_HEIGHT = 345;

const CARD_CONFIG: Record<
  CardType,
  { title: string; subtitle: string; icon: ReactNode }
> = {
  gauge: {
    title: "Overall Active Percentage",
    subtitle: "Active designation ratio",
    icon: <SpeedIcon sx={{ fontSize: 18 }} />,
  },
  status: {
    title: "Overall Status",
    subtitle: "Active vs inactive",
    icon: <DonutLargeIcon sx={{ fontSize: 18 }} />,
  },
  department: {
    title: "Department-wise Distribution",
    subtitle: "Designation count by department",
    icon: <ApartmentIcon sx={{ fontSize: 18 }} />,
  },
  grade: {
    title: "Grade-wise Distribution",
    subtitle: "Designation count by grade",
    icon: <BarChartIcon sx={{ fontSize: 18 }} />,
  },
  date: {
    title: "Date-wise Trend",
    subtitle: "Designation trend by date",
    icon: <TimelineIcon sx={{ fontSize: 18 }} />,
  },
  stacked: {
    title: "Active vs Inactive",
    subtitle: "Status comparison",
    icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
  },
  summary: {
    title: "Overall Summary",
    subtitle: "Total designation overview",
    icon: <AssessmentIcon sx={{ fontSize: 18 }} />,
  },
};

const getDateString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getToday = (): string => getDateString(new Date());

const getDateBefore = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return getDateString(d);
};

const getMonthStart = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

const getDefaultFilters = (): DashboardFilters => ({
  fromDate: getDateBefore(6),
  toDate: getToday(),
  department: "",
  level: "",
  grade: "",
  status: "",
});

const normalizeChartData = (data: unknown): ChartPoint[] => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const row = item as { label?: unknown; value?: unknown; count?: unknown };
    return {
      label: String(row.label ?? ""),
      value: Number(row.value ?? row.count ?? 0),
    };
  });
};

const getDisplayValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "object" && item !== null
          ? String(
              (item as { label?: unknown }).label ??
                (item as { value?: unknown }).value ??
                "",
            )
          : String(item),
      )
      .join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getCreatedDate = (value?: string): string => {
  if (!value) return "";
  const m = value.match(/\d{2}-\d{2}-\d{4}/);
  if (m) {
    const [day, month, year] = m[0].split("-");
    return `${year}-${month}-${day}`;
  }
  return value.slice(0, 10);
};

// 👇 Header mapping helpers
const KEY_TO_HEADER_ALIAS: Record<string, string> = {
  branchIds: "Applicable Branch",
  departmentName: "Department",
  departmentId: "Department",
  parentDesignationId: "Parent Designation",
  minExperience: "Minimum Experience",
  maxExperience: "Maximum Experience",
};

const toTitleCase = (key: string): string =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (v) => v.toUpperCase())
    .trim();

const ChartCard = ({
  title,
  subtitle,
  icon,
  viewMode,
  onViewChange,
  children,
}: ChartCardProps) => (
  <Card
    elevation={0}
    sx={{
      height: 430,
      border: "1px solid #B8C6D3",
      borderRadius: 2,
      backgroundColor: "#FFFFFF",
      overflow: "hidden",
      "&:hover": { boxShadow: "0 7px 20px rgba(16,42,67,0.12)" },
    }}
  >
    <Box sx={{ px: 1.5, pt: 1.1, pb: 0.8 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
          <Box
            component="span"
            onClick={() => onViewChange("graph")}
            sx={{
              fontSize: 12,
              color: viewMode === "graph" ? COLORS.primary : COLORS.neutral,
              fontWeight: viewMode === "graph" ? 800 : 500,
              cursor: "pointer",
            }}
          >
            Graph
          </Box>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            size="small"
            onChange={(_e, value) => value && onViewChange(value)}
            sx={{
              height: 23,
              "& .MuiToggleButton-root": {
                minWidth: 30,
                px: 0.7,
                py: 0,
                borderColor: "#D4DEE8",
              },
            }}
          >
            <ToggleButton value="graph">
              <BarChartIcon sx={{ fontSize: 13 }} />
            </ToggleButton>
            <ToggleButton value="table">
              <TableChartIcon sx={{ fontSize: 13 }} />
            </ToggleButton>
          </ToggleButtonGroup>
          <Box
            component="span"
            onClick={() => onViewChange("table")}
            sx={{
              fontSize: 12,
              color: viewMode === "table" ? COLORS.primary : COLORS.neutral,
              fontWeight: viewMode === "table" ? 800 : 500,
              cursor: "pointer",
            }}
          >
            Table
          </Box>
        </Box>
        <Box
          sx={{
            width: 31,
            height: 31,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#EAF2FA",
            color: COLORS.primary,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Box sx={{ textAlign: "center", mt: 0.5 }}>
        <Box
          component="div"
          sx={{ fontSize: 15, fontWeight: 800, color: "#294B70" }}
        >
          {title}
        </Box>
        <Box
          component="div"
          sx={{ fontSize: 11, color: COLORS.neutral, mt: 0.2 }}
        >
          {subtitle}
        </Box>
      </Box>
    </Box>
    <Divider />
    <Box sx={{ height: 350, px: 1 }}>{children}</Box>
  </Card>
);

const ChartTable = ({
  rows,
  onCountClick,
}: {
  rows: ChartPoint[];
  onCountClick?: (row: ChartPoint) => void;
}) => {
  const columns: MRT_ColumnDef<ChartPoint>[] = [
    {
      accessorKey: "label",
      header: "Category",
      Cell: ({ row }) => (
        <Box
          component="span"
          onClick={() => onCountClick?.(row.original)}
          sx={{
            cursor: onCountClick ? "pointer" : "default",
            color: onCountClick ? COLORS.primary : "inherit",
            fontWeight: onCountClick ? 700 : 500,
          }}
        >
          <TableText value={row.original.label} align="left" maxWidth={220} />
        </Box>
      ),
    },
    {
      accessorKey: "value",
      header: "Count",
      Cell: ({ row }) => (
        <Chip
          size="small"
          label={row.original.value}
          clickable={Boolean(onCountClick)}
          onClick={() => onCountClick?.(row.original)}
          sx={{
            fontWeight: 800,
            minWidth: 55,
            cursor: onCountClick ? "pointer" : "default",
          }}
        />
      ),
    },
  ];
  return (
    <Box sx={{ height: 345, width: "100%", overflow: "hidden" }}>
      <DesignationTable data={rows} columns={columns} loading={false} />
    </Box>
  );
};

const Dashboard = () => {
  const [filters, setFilters] = useState<DashboardFilters>(getDefaultFilters());
  const [analytics, setAnalytics] = useState<DesignationAnalytics | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  const [dropdowns, setDropdowns] = useState<{
    departments: { id: number; name: string; status: boolean }[];
    levels: number[];
    grades: string[];
    statuses: boolean[];
  }>({ departments: [], levels: [], grades: [], statuses: [] });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailRows, setDetailRows] = useState<DashboardDesignation[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailHeaders, setDetailHeaders] = useState<string[]>([]); //new

  const [library, setLibrary] = useState<ChartLibrary>("react");
  const [viewModes, setViewModes] = useState<Record<CardType, ViewMode>>({
    gauge: "graph",
    status: "graph",
    grade: "graph",
    date: "graph",
    stacked: "graph",
    summary: "graph",
    department: "graph",
  });

  const amRefs: Record<CardType, RefObject<HTMLDivElement | null>> = {
    gauge: useRef<HTMLDivElement | null>(null),
    status: useRef<HTMLDivElement | null>(null),
    grade: useRef<HTMLDivElement | null>(null),
    date: useRef<HTMLDivElement | null>(null),
    stacked: useRef<HTMLDivElement | null>(null),
    summary: useRef<HTMLDivElement | null>(null),
    department: useRef<HTMLDivElement | null>(null),
  };

  // ----- Load dropdowns + dynamic headers -----
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const result = await getDropdowns();
        setDropdowns({
          departments: Array.isArray(result.departments)
            ? result.departments
            : [],
          levels: Array.isArray(result.levels) ? result.levels : [],
          grades: Array.isArray(result.grades) ? result.grades.map(String) : [],
          statuses: Array.isArray(result.statuses) ? result.statuses : [],
        });
      } catch (err) {
        console.error("Dropdown error:", err);
      }
    };
    const loadHeaders = async () => {
      try {
        const headers = await getDesignationExcelHeaders();
        setDetailHeaders(Array.isArray(headers) ? headers : []);
      } catch (err) {
        console.error("Failed to load excel headers:", err);
      }
    };
    void loadDropdowns();
    void loadHeaders();
  }, []);

  const loadCounts = async () => {
    try {
      const [total, active, inactive] = await Promise.all([
        getDesignationCount(),
        getDesignationCount(true),
        getDesignationCount(false),
      ]);
      setTotalCount(Number(total) || 0);
      setActiveCount(Number(active) || 0);
      setInactiveCount(Number(inactive) || 0);
    } catch (err) {
      console.error("Count API error:", err);
    }
  };

  const loadAnalytics = async (currentFilters: DashboardFilters) => {
    try {
      setLoading(true);
      setError("");
      const result = await getDesignationAnalytics({
        fromDate: currentFilters.fromDate || null,
        toDate: currentFilters.toDate || null,
        departmentId: currentFilters.department
          ? Number(currentFilters.department)
          : null,
        designationLevel: currentFilters.level
          ? Number(currentFilters.level)
          : null,
        grade: currentFilters.grade || null,
        status:
          currentFilters.status === ""
            ? null
            : currentFilters.status === "true",
      });
      setAnalytics(result);
      const r = result as unknown as {
        total?: number;
        active?: number;
        inactive?: number;
      };
      if (typeof r.total === "number") setTotalCount(r.total);
      if (typeof r.active === "number") setActiveCount(r.active);
      if (typeof r.inactive === "number") setInactiveCount(r.inactive);
    } catch (err) {
      console.error("Analytics API error:", err);
      setError("Unable to load dashboard analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCounts();
    void loadAnalytics(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activePercentage =
    totalCount > 0 ? (activeCount / totalCount) * 100 : 0;

  const gradeData = useMemo(
    () => normalizeChartData(analytics?.gradeWise),
    [analytics],
  );
  const statusData = useMemo(
    () => normalizeChartData(analytics?.statusWise),
    [analytics],
  );
  const dateData = useMemo(
    () => normalizeChartData(analytics?.dateWise),
    [analytics],
  );

  const departmentData = useMemo<ChartPoint[]>(() => {
    const raw = (analytics as unknown as { departmentWise?: unknown })
      ?.departmentWise;
    const points = normalizeChartData(raw);
    return points.map((p) => {
      const match = dropdowns.departments.find(
        (d) => String(d.id) === String(p.label),
      );
      return { label: match?.name ?? p.label, value: p.value };
    });
  }, [analytics, dropdowns.departments]);

  const stackedData: ChartPoint[] = [
    { label: "Active", value: activeCount },
    { label: "Inactive", value: inactiveCount },
  ];
  const summaryData: ChartPoint[] = [
    { label: "Total", value: totalCount },
    { label: "Active", value: activeCount },
    { label: "Inactive", value: inactiveCount },
  ];

  const getDepartmentName = (id: string): string => {
    if (!id) return "";
    const found = dropdowns.departments.find((d) => String(d.id) === id);
    return found?.name ?? id;
  };

  const changeFilter = (field: keyof DashboardFilters, value: string) =>
    setFilters((p) => ({ ...p, [field]: value }));

  const changeView = (card: CardType, value: ViewMode) =>
    setViewModes((p) => ({ ...p, [card]: value }));

  const handleSearch = () => {
    if (
      filters.fromDate &&
      filters.toDate &&
      filters.fromDate > filters.toDate
    ) {
      setError("From Date cannot be greater than To Date.");
      return;
    }
    setError("");
    void loadAnalytics(filters);
    void loadCounts();
  };

  const handleReset = () => {
    const reset = getDefaultFilters();
    setFilters(reset);
    setError("");
    void loadAnalytics(reset);
    void loadCounts();
  };

  const setDateRange = (type: "today" | "7days" | "30days" | "month") => {
    let fromDate = getToday();
    if (type === "7days") fromDate = getDateBefore(6);
    if (type === "30days") fromDate = getDateBefore(29);
    if (type === "month") fromDate = getMonthStart();
    const next = { ...filters, fromDate, toDate: getToday() };
    setFilters(next);
    void loadAnalytics(next);
    void loadCounts();
  };

  const handleCountClick = (status: "all" | "active" | "inactive") => {
    const next: DashboardFilters = {
      ...filters,
      status: status === "all" ? "" : status === "active" ? "true" : "false",
    };
    setFilters(next);
    changeView("summary", "table");
    void loadAnalytics(next);
  };

  const loadDetailRows = async (card: CardType, row: ChartPoint) => {
    try {
      setDetailLoading(true);
      const result = await getDesignations(0, 1000, "id", "desc");
      let rows = (result.content ?? []) as unknown as DashboardDesignation[];

      rows = rows.filter((item) => {
        const createdDate = getCreatedDate(String(item.createdAt ?? ""));
        if (filters.fromDate && createdDate < filters.fromDate) return false;
        if (filters.toDate && createdDate > filters.toDate) return false;
        if (
          filters.department &&
          String(item.departmentId ?? "") !== String(filters.department)
        )
          return false;
        if (
          filters.level &&
          Number(item.designationLevel) !== Number(filters.level)
        )
          return false;
        if (
          filters.grade &&
          String(item.grade ?? "").toLowerCase() !== filters.grade.toLowerCase()
        )
          return false;
        if (
          filters.status !== "" &&
          Boolean(item.status) !== (filters.status === "true")
        )
          return false;
        return true;
      });

      if (card === "department") {
        const department = dropdowns.departments.find(
          (item) => item.name.toLowerCase() === row.label.toLowerCase(),
        );
        rows = rows.filter((item) =>
          department
            ? String(item.departmentId ?? "") === String(department.id)
            : String(item.departmentName ?? "").toLowerCase() ===
              row.label.toLowerCase(),
        );
      }
      if (card === "grade") {
        rows = rows.filter(
          (item) =>
            String(item.grade ?? "").toLowerCase() === row.label.toLowerCase(),
        );
      }
      if (card === "status" || card === "stacked" || card === "summary") {
        if (row.label.toLowerCase() === "active")
          rows = rows.filter((item) => item.status === true);
        if (row.label.toLowerCase() === "inactive")
          rows = rows.filter((item) => item.status === false);
      }
      if (card === "date") {
        rows = rows.filter(
          (item) => getCreatedDate(String(item.createdAt ?? "")) === row.label,
        );
      }
      if (card === "gauge") {
        rows = rows.filter((item) => item.status === true);
      }

      setDetailRows(rows);
      setDetailTitle(`${row.label} - ${rows.length} Designations`);
      setDetailOpen(true);
    } catch (err) {
      console.error("Dashboard detail error:", err);
      setError("Unable to load designation details.");
    } finally {
      setDetailLoading(false);
    }
  };

  // ----- Detail columns (dynamic headers) -----
  const excludedDetailFields = new Set([
    "id",
    "departmentId",
    "createdAt",
    "createdBy",
    "updatedAt",
    "updatedBy",
    "isDeleted",
    "correctData",
    "incorrectData",
    "duplicateData",
    "rowComment",
  ]);

  // camelCase key → backend English header (via alias or title case)
  const getDetailHeader = (key: string): string => {
    const alias = KEY_TO_HEADER_ALIAS[key];
    const titleCase = alias ?? toTitleCase(key);
    const match = detailHeaders.find(
      (h) => h.toLowerCase() === titleCase.toLowerCase(),
    );
    return match ?? titleCase;
  };

  const detailColumns = useMemo<MRT_ColumnDef<DashboardDesignation>[]>(() => {
    const keys = Array.from(
      new Set(detailRows.flatMap((item) => Object.keys(item))),
    ).filter((key) => !excludedDetailFields.has(key));

    return keys.map((key) => ({
      accessorKey: key,
      header: getDetailHeader(key),
      Cell: ({ row }) => {
        const value = row.original[key];
        if (key === "status") {
          return (
            <Chip
              size="small"
              label={value ? "ACTIVE" : "INACTIVE"}
              sx={{
                backgroundColor: value ? COLORS.active : COLORS.inactive,
                color: "#fff",
                fontWeight: 800,
              }}
            />
          );
        }
        if (key === "departmentName" && !value) {
          return (
            <TableText
              value={getDepartmentName(String(row.original.departmentId ?? ""))}
              maxWidth={220}
              align="left"
            />
          );
        }
        return (
          <TableText
            value={getDisplayValue(value)}
            maxWidth={220}
            align="left"
          />
        );
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailRows, dropdowns.departments, detailHeaders]);

  // ----- React chart renderers -----
  const renderReactGauge = () => {
    if (viewModes.gauge === "table") {
      return (
        <ChartTable
          rows={[
            {
              label: "Active Percentage",
              value: Number(activePercentage.toFixed(1)),
            },
          ]}
          onCountClick={(row) => void loadDetailRows("gauge", row)}
        />
      );
    }
    return (
      <Box
        onClick={() => changeView("gauge", "table")}
        sx={{
          height: CHART_BOX_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Gauge
          width={330}
          height={300}
          value={Math.min(100, Math.max(0, activePercentage))}
          valueMin={0}
          valueMax={100}
          startAngle={-110}
          endAngle={110}
          text={({ value }) => `${Number(value ?? 0).toFixed(1)}%`}
          sx={{
            "& .MuiGauge-valueArc": { fill: COLORS.active },
            "& .MuiGauge-referenceArc": { fill: "#E0E7EF" },
            "& .MuiGauge-valueText": { fontSize: 28, fontWeight: 800 },
          }}
        />
      </Box>
    );
  };

  const renderReactStatus = () => {
    if (viewModes.status === "table") {
      return (
        <ChartTable
          rows={statusData}
          onCountClick={(row) => void loadDetailRows("status", row)}
        />
      );
    }
    return (
      <Box
        onClick={() => changeView("status", "table")}
        sx={{
          height: CHART_BOX_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <PieChart
          height={CHART_HEIGHT}
          width={390}
          colors={[
            COLORS.active,
            COLORS.inactive,
            COLORS.primary,
            COLORS.warning,
          ]}
          series={[
            {
              data: statusData.map((item, index) => ({
                id: index,
                value: item.value,
                label: item.label,
              })),
              innerRadius: 70,
              outerRadius: 125,
              paddingAngle: 3,
              cornerRadius: 5,
            },
          ]}
        />
      </Box>
    );
  };

  const renderReactGrade = () => {
    if (viewModes.grade === "table") {
      return (
        <ChartTable
          rows={gradeData}
          onCountClick={(row) => void loadDetailRows("grade", row)}
        />
      );
    }
    return (
      <Box
        onClick={() => changeView("grade", "table")}
        sx={{ height: CHART_BOX_HEIGHT, cursor: "pointer" }}
      >
        <BarChart
          height={CHART_HEIGHT}
          xAxis={[{ scaleType: "band", data: gradeData.map((d) => d.label) }]}
          series={[
            { data: gradeData.map((d) => d.value), label: "Designations" },
          ]}
          colors={CHART_PALETTE}
          margin={{ top: 25, right: 15, bottom: 60, left: 50 }}
          grid={{ horizontal: true }}
        />
      </Box>
    );
  };

  const renderReactDate = () => {
    if (viewModes.date === "table") {
      return (
        <ChartTable
          rows={dateData}
          onCountClick={(row) => void loadDetailRows("date", row)}
        />
      );
    }
    return (
      <Box
        onClick={() => changeView("date", "table")}
        sx={{ height: CHART_BOX_HEIGHT, cursor: "pointer" }}
      >
        <LineChart
          height={CHART_HEIGHT}
          xAxis={[{ scaleType: "point", data: dateData.map((d) => d.label) }]}
          series={[
            {
              data: dateData.map((d) => d.value),
              label: "Designations",
              area: true,
            },
          ]}
          colors={[COLORS.info]}
          margin={{ top: 25, right: 15, bottom: 60, left: 50 }}
          grid={{ horizontal: true }}
        />
      </Box>
    );
  };

  const renderReactStacked = () => {
    if (viewModes.stacked === "table") {
      return (
        <ChartTable
          rows={stackedData}
          onCountClick={(row) => void loadDetailRows("stacked", row)}
        />
      );
    }
    return (
      <Box
        onClick={() => changeView("stacked", "table")}
        sx={{ height: CHART_BOX_HEIGHT, cursor: "pointer" }}
      >
        <BarChart
          height={CHART_HEIGHT}
          xAxis={[{ scaleType: "band", data: ["Designation Status"] }]}
          series={[
            { data: [activeCount], label: "Active", stack: "status" },
            { data: [inactiveCount], label: "Inactive", stack: "status" },
          ]}
          colors={[COLORS.active, COLORS.inactive]}
          margin={{ top: 25, right: 15, bottom: 60, left: 50 }}
          grid={{ horizontal: true }}
        />
      </Box>
    );
  };

  const renderReactSummary = () => {
    if (viewModes.summary === "table") {
      return (
        <ChartTable
          rows={summaryData}
          onCountClick={(row) => void loadDetailRows("summary", row)}
        />
      );
    }
    return (
      <Box
        onClick={() => changeView("summary", "table")}
        sx={{ height: CHART_BOX_HEIGHT, cursor: "pointer" }}
      >
        <BarChart
          height={CHART_HEIGHT}
          xAxis={[{ scaleType: "band", data: ["Total", "Active", "Inactive"] }]}
          series={[
            {
              data: [totalCount, activeCount, inactiveCount],
              label: "Designations",
            },
          ]}
          colors={[COLORS.total, COLORS.active, COLORS.inactive]}
          margin={{ top: 25, right: 15, bottom: 60, left: 50 }}
          grid={{ horizontal: true }}
        />
      </Box>
    );
  };

  const renderReactDepartment = () => {
    if (viewModes.department === "table") {
      return (
        <ChartTable
          rows={departmentData}
          onCountClick={(row) => void loadDetailRows("department", row)}
        />
      );
    }
    return (
      <Box
        onClick={() => changeView("department", "table")}
        sx={{ height: CHART_BOX_HEIGHT, cursor: "pointer" }}
      >
        <BarChart
          height={CHART_HEIGHT}
          xAxis={[
            { scaleType: "band", data: departmentData.map((d) => d.label) },
          ]}
          series={[
            { data: departmentData.map((d) => d.value), label: "Designations" },
          ]}
          colors={CHART_PALETTE}
          margin={{ top: 25, right: 15, bottom: 70, left: 50 }}
          grid={{ horizontal: true }}
        />
      </Box>
    );
  };

  // ----- AmCharts effect -----
  useEffect(() => {
    if (library !== "amchart") return;
    const roots: am5.Root[] = [];

    if (amRefs.gauge.current && viewModes.gauge === "graph") {
      const root = am5.Root.new(amRefs.gauge.current);
      roots.push(root);
      root.setThemes([am5themes_Animated.new(root)]);
      const chart = root.container.children.push(
        am5radar.RadarChart.new(root, {
          panX: false,
          panY: false,
          startAngle: 180,
          endAngle: 360,
        }),
      );
      const renderer = am5radar.AxisRendererCircular.new(root, {
        innerRadius: -25,
      });
      const axis = chart.xAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          max: 100,
          strictMinMax: true,
          renderer,
        }),
      );
      const addRange = (start: number, end: number, color: number) => {
        axis
          .createAxisRange(axis.makeDataItem({ value: start, endValue: end }))
          .get("axisFill")
          ?.setAll({ visible: true, fill: am5.color(color), fillOpacity: 0.9 });
      };
      addRange(0, 40, 0xc62828);
      addRange(40, 70, 0xf9a825);
      addRange(70, 100, 0x4f7354);
      const dataItem = axis.makeDataItem({
        value: Math.min(100, Math.max(0, activePercentage)),
      });
      const hand = am5radar.ClockHand.new(root, {
        pinRadius: 9,
        radius: am5.percent(92),
        bottomWidth: 15,
        topWidth: 2,
      });
      hand.hand.setAll({
        fill: am5.color(0x123b63),
        stroke: am5.color(0x123b63),
      });
      hand.pin.setAll({
        fill: am5.color(0x123b63),
        stroke: am5.color(0x123b63),
      });
      dataItem.set("bullet", am5xy.AxisBullet.new(root, { sprite: hand }));
      axis.createAxisRange(dataItem);
      chart.radarContainer.children.push(
        am5.Label.new(root, {
          text: `${activePercentage.toFixed(1)}%`,
          centerX: am5.percent(50),
          centerY: am5.percent(50),
          fontSize: 25,
          fontWeight: "700",
          fill: am5.color(0x102a43),
        }),
      );
    }

    if (amRefs.status.current && viewModes.status === "graph") {
      const root = am5.Root.new(amRefs.status.current);
      roots.push(root);
      root.setThemes([am5themes_Animated.new(root)]);
      const chart = root.container.children.push(
        am5percent.PieChart.new(root, { layout: root.verticalLayout }),
      );
      const series = chart.series.push(
        am5percent.PieSeries.new(root, {
          valueField: "value",
          categoryField: "label",
          innerRadius: am5.percent(55),
        }),
      );
      series.set(
        "colors",
        am5.ColorSet.new(root, {
          colors: [
            am5.color(0x4f7354),
            am5.color(0xc62828),
            am5.color(0x123b63),
            am5.color(0xf9a825),
          ],
        }),
      );
      series.data.setAll(statusData);
      series.appear(700, 100);
    }

    const buildXyChart = (
      container: HTMLDivElement,
      data: ChartPoint[],
      type: "column" | "line",
      color: number,
      opts: { cornerRadius?: boolean; minGrid?: number } = {},
    ) => {
      const root = am5.Root.new(container);
      roots.push(root);
      root.setThemes([am5themes_Animated.new(root)]);
      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: "none",
          wheelY: "none",
        }),
      );
      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "label",
          renderer: am5xy.AxisRendererX.new(root, {
            minGridDistance: opts.minGrid ?? 25,
          }),
        }),
      );
      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          renderer: am5xy.AxisRendererY.new(root, {}),
        }),
      );
      xAxis.data.setAll(data);

      if (type === "column") {
        const series = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            name: "Designations",
            xAxis,
            yAxis,
            valueYField: "value",
            categoryXField: "label",
          }),
        );
        series.columns.template.setAll({
          fill: am5.color(color),
          strokeOpacity: 0,
          ...(opts.cornerRadius
            ? { cornerRadiusTL: 5, cornerRadiusTR: 5 }
            : {}),
        });
        series.data.setAll(data);
        series.appear(700);
      } else {
        const series = chart.series.push(
          am5xy.LineSeries.new(root, {
            name: "Designations",
            xAxis,
            yAxis,
            valueYField: "value",
            categoryXField: "label",
          }),
        );
        series.strokes.template.setAll({
          stroke: am5.color(color),
          strokeWidth: 4,
        });
        series.data.setAll(data);
        series.appear(700);
      }
    };

    if (amRefs.grade.current && viewModes.grade === "graph")
      buildXyChart(amRefs.grade.current, gradeData, "column", 0x123b63, {
        cornerRadius: true,
      });
    if (amRefs.date.current && viewModes.date === "graph")
      buildXyChart(amRefs.date.current, dateData, "line", 0x1565c0);
    if (amRefs.summary.current && viewModes.summary === "graph")
      buildXyChart(amRefs.summary.current, summaryData, "column", 0x123b63, {
        cornerRadius: true,
      });
    if (amRefs.department.current && viewModes.department === "graph")
      buildXyChart(
        amRefs.department.current,
        departmentData,
        "column",
        0x1d70a2,
        { cornerRadius: true },
      );

    if (amRefs.stacked.current && viewModes.stacked === "graph") {
      const root = am5.Root.new(amRefs.stacked.current);
      roots.push(root);
      root.setThemes([am5themes_Animated.new(root)]);
      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: "none",
          wheelY: "none",
        }),
      );
      const data = [
        {
          label: "Designation Status",
          active: activeCount,
          inactive: inactiveCount,
        },
      ];
      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "label",
          renderer: am5xy.AxisRendererX.new(root, {}),
        }),
      );
      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          renderer: am5xy.AxisRendererY.new(root, {}),
        }),
      );
      xAxis.data.setAll(data);
      const activeSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: "Active",
          xAxis,
          yAxis,
          valueYField: "active",
          categoryXField: "label",
          stacked: true,
        }),
      );
      activeSeries.columns.template.setAll({
        fill: am5.color(0x4f7354),
        strokeOpacity: 0,
      });
      const inactiveSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: "Inactive",
          xAxis,
          yAxis,
          valueYField: "inactive",
          categoryXField: "label",
          stacked: true,
        }),
      );
      inactiveSeries.columns.template.setAll({
        fill: am5.color(0xc62828),
        strokeOpacity: 0,
      });
      activeSeries.data.setAll(data);
      inactiveSeries.data.setAll(data);
    }

    return () => roots.forEach((root) => root.dispose());
  }, [
    library,
    analytics,
    gradeData,
    statusData,
    dateData,
    departmentData,
    activeCount,
    inactiveCount,
    totalCount,
    activePercentage,
    viewModes,
  ]);

  const renderAmChart = (
    card: CardType,
    ref: RefObject<HTMLDivElement | null>,
  ) => {
    if (viewModes[card] === "table") {
      let rows: ChartPoint[] = [];
      if (card === "grade") rows = gradeData;
      if (card === "status") rows = statusData;
      if (card === "date") rows = dateData;
      if (card === "stacked") rows = stackedData;
      if (card === "summary") rows = summaryData;
      if (card === "department") rows = departmentData;
      if (card === "gauge")
        rows = [
          {
            label: "Active Percentage",
            value: Number(activePercentage.toFixed(1)),
          },
        ];
      return (
        <ChartTable
          rows={rows}
          onCountClick={(row) => void loadDetailRows(card, row)}
        />
      );
    }
    return (
      <Box
        ref={ref}
        onClick={() => changeView(card, "table")}
        sx={{ width: "100%", height: CHART_BOX_HEIGHT, cursor: "pointer" }}
      />
    );
  };

  // ----- Apex renderers -----
  const apexWrap = (card: CardType, node: ReactNode) => (
    <Box
      onClick={() => changeView(card, "table")}
      sx={{ height: CHART_BOX_HEIGHT, cursor: "pointer" }}
    >
      {node}
    </Box>
  );

  const renderApexGauge = () => {
    if (viewModes.gauge === "table") {
      return (
        <ChartTable
          rows={[
            {
              label: "Active Percentage",
              value: Number(activePercentage.toFixed(1)),
            },
          ]}
          onCountClick={(row) => void loadDetailRows("gauge", row)}
        />
      );
    }
    const options: ApexOptions = {
      chart: { type: "radialBar", height: CHART_HEIGHT },
      plotOptions: {
        radialBar: {
          hollow: { size: "55%" },
          track: { background: "#E0E7EF" },
          dataLabels: {
            name: { show: false },
            value: {
              fontSize: "28px",
              fontWeight: 800,
              color: "#102a43",
              formatter: (val: number) => `${val.toFixed(1)}%`,
            },
          },
        },
      },
      colors: [COLORS.active],
      labels: ["Active"],
    };
    return apexWrap(
      "gauge",
      <ReactApexChart
        options={options}
        series={[Math.min(100, Math.max(0, activePercentage))]}
        type="radialBar"
        height={CHART_HEIGHT}
      />,
    );
  };

  const renderApexStatus = () => {
    if (viewModes.status === "table") {
      return (
        <ChartTable
          rows={statusData}
          onCountClick={(row) => void loadDetailRows("status", row)}
        />
      );
    }
    const options: ApexOptions = {
      chart: { type: "donut", height: CHART_HEIGHT },
      labels: statusData.map((d) => d.label),
      colors: [COLORS.active, COLORS.inactive, COLORS.primary, COLORS.warning],
      legend: { position: "bottom" },
      dataLabels: { enabled: true },
      plotOptions: { pie: { donut: { size: "60%" } } },
    };
    return apexWrap(
      "status",
      <ReactApexChart
        options={options}
        series={statusData.map((d) => d.value)}
        type="donut"
        height={CHART_HEIGHT}
      />,
    );
  };

  const renderApexGrade = () => {
    if (viewModes.grade === "table") {
      return (
        <ChartTable
          rows={gradeData}
          onCountClick={(row) => void loadDetailRows("grade", row)}
        />
      );
    }
    const options: ApexOptions = {
      chart: { type: "bar", height: CHART_HEIGHT, toolbar: { show: false } },
      xaxis: { categories: gradeData.map((d) => d.label) },
      colors: [COLORS.primary],
      plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
      dataLabels: { enabled: false },
      grid: { borderColor: "#E0E7EF" },
    };
    return apexWrap(
      "grade",
      <ReactApexChart
        options={options}
        series={[{ name: "Designations", data: gradeData.map((d) => d.value) }]}
        type="bar"
        height={CHART_HEIGHT}
      />,
    );
  };

  const renderApexDate = () => {
    if (viewModes.date === "table") {
      return (
        <ChartTable
          rows={dateData}
          onCountClick={(row) => void loadDetailRows("date", row)}
        />
      );
    }
    const options: ApexOptions = {
      chart: { type: "area", height: CHART_HEIGHT, toolbar: { show: false } },
      xaxis: { categories: dateData.map((d) => d.label) },
      colors: [COLORS.info],
      stroke: { curve: "smooth", width: 3 },
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 0.4, opacityFrom: 0.6, opacityTo: 0.1 },
      },
      dataLabels: { enabled: false },
      grid: { borderColor: "#E0E7EF" },
    };
    return apexWrap(
      "date",
      <ReactApexChart
        options={options}
        series={[{ name: "Designations", data: dateData.map((d) => d.value) }]}
        type="area"
        height={CHART_HEIGHT}
      />,
    );
  };

  const renderApexStacked = () => {
    if (viewModes.stacked === "table") {
      return (
        <ChartTable
          rows={stackedData}
          onCountClick={(row) => void loadDetailRows("stacked", row)}
        />
      );
    }
    const options: ApexOptions = {
      chart: {
        type: "bar",
        height: CHART_HEIGHT,
        stacked: true,
        toolbar: { show: false },
      },
      xaxis: { categories: ["Designation Status"] },
      colors: [COLORS.active, COLORS.inactive],
      plotOptions: { bar: { columnWidth: "45%", borderRadius: 4 } },
      dataLabels: { enabled: false },
      legend: { position: "bottom" },
      grid: { borderColor: "#E0E7EF" },
    };
    return apexWrap(
      "stacked",
      <ReactApexChart
        options={options}
        series={[
          { name: "Active", data: [activeCount] },
          { name: "Inactive", data: [inactiveCount] },
        ]}
        type="bar"
        height={CHART_HEIGHT}
      />,
    );
  };

  const renderApexSummary = () => {
    if (viewModes.summary === "table") {
      return (
        <ChartTable
          rows={summaryData}
          onCountClick={(row) => void loadDetailRows("summary", row)}
        />
      );
    }
    const options: ApexOptions = {
      chart: { type: "bar", height: CHART_HEIGHT, toolbar: { show: false } },
      xaxis: { categories: ["Total", "Active", "Inactive"] },
      colors: [COLORS.total, COLORS.active, COLORS.inactive],
      plotOptions: { bar: { columnWidth: "45%", borderRadius: 4 } },
      dataLabels: { enabled: true },
      grid: { borderColor: "#E0E7EF" },
    };
    return apexWrap(
      "summary",
      <ReactApexChart
        options={options}
        series={[
          {
            name: "Designations",
            data: [totalCount, activeCount, inactiveCount],
          },
        ]}
        type="bar"
        height={CHART_HEIGHT}
      />,
    );
  };

  const renderApexDepartment = () => {
    if (viewModes.department === "table") {
      return (
        <ChartTable
          rows={departmentData}
          onCountClick={(row) => void loadDetailRows("department", row)}
        />
      );
    }
    const options: ApexOptions = {
      chart: { type: "bar", height: CHART_HEIGHT, toolbar: { show: false } },
      xaxis: { categories: departmentData.map((d) => d.label) },
      colors: [COLORS.secondary],
      plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
      dataLabels: { enabled: false },
      grid: { borderColor: "#E0E7EF" },
    };
    return apexWrap(
      "department",
      <ReactApexChart
        options={options}
        series={[
          { name: "Designations", data: departmentData.map((d) => d.value) },
        ]}
        type="bar"
        height={CHART_HEIGHT}
      />,
    );
  };

  const renderChart = (
    card: CardType,
    amRef: RefObject<HTMLDivElement | null>,
    reactRenderer: () => ReactNode,
  ) => {
    if (loading) {
      return (
        <Box
          sx={{
            height: CHART_BOX_HEIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (library === "react") return reactRenderer();
    if (library === "amchart") return renderAmChart(card, amRef);

    const apexMap: Record<CardType, () => ReactNode> = {
      gauge: renderApexGauge,
      status: renderApexStatus,
      grade: renderApexGrade,
      date: renderApexDate,
      stacked: renderApexStacked,
      summary: renderApexSummary,
      department: renderApexDepartment,
    };
    return apexMap[card]();
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F4F7FA" }}>
      <Box
        component="main"
        sx={{ pt: 1.5, px: { xs: 1.5, sm: 2, md: 3 }, pb: 4 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssessmentIcon sx={{ fontSize: 28, color: COLORS.primary }} />
            <Box>
              <Box
                component="div"
                sx={{ fontSize: 22, fontWeight: 800, color: "#163A5F" }}
              >
                Dashboard
              </Box>
              <Box component="div" sx={{ fontSize: 12, color: "#E8EFF4" }}>
                Designation analytics and performance overview
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 0.7, flexWrap: "wrap" }}>
            <Chip
              size="small"
              label={`From: ${filters.fromDate}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`To: ${filters.toDate}`}
              variant="outlined"
            />
            {filters.department && (
              <Chip
                size="small"
                label={`Dept: ${getDepartmentName(filters.department)}`}
                variant="outlined"
                color="primary"
              />
            )}
          </Box>
        </Box>

        {/* Status tiles */}
        <Paper
          elevation={0}
          sx={{
            p: 1.2,
            mb: 1.2,
            border: "1px solid #D5DFE8",
            borderRadius: 2,
            backgroundColor: "#FFFFFF",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" },
              gap: 1,
            }}
          >
            {(
              [
                {
                  key: "all",
                  label: "Total Designations",
                  value: totalCount,
                  color: COLORS.total,
                  labelColor: "#E8EFF4",
                  shadow: "rgba(83,111,136,0.25)",
                },
                {
                  key: "active",
                  label: "Active",
                  value: activeCount,
                  color: COLORS.active,
                  labelColor: "#EAF2EA",
                  shadow: "rgba(79,115,84,0.25)",
                },
                {
                  key: "inactive",
                  label: "Inactive",
                  value: inactiveCount,
                  color: COLORS.inactive,
                  labelColor: "#F7E9E7",
                  shadow: "rgba(198,40,40,0.25)",
                },
              ] as const
            ).map((tile) => (
              <Box
                key={tile.key}
                onClick={() => handleCountClick(tile.key)}
                sx={{
                  textAlign: "center",
                  p: 1,
                  borderRadius: 1.5,
                  backgroundColor: tile.color,
                  cursor: "pointer",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 12px ${tile.shadow}`,
                  },
                }}
              >
                <Box
                  component="div"
                  sx={{ fontSize: 11, color: tile.labelColor }}
                >
                  {tile.label}
                </Box>
                <Box
                  component="div"
                  sx={{ fontSize: 23, fontWeight: 800, color: "#FFFFFF" }}
                >
                  {tile.value}
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 1.2,
            mb: 1.2,
            border: "1px solid #D5DFE8",
            borderRadius: 2,
            backgroundColor: "#FFFFFF",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2,1fr)",
                md: "repeat(6,1fr)",
              },
              gap: 1,
            }}
          >
            <TextField
              label="From Date"
              type="date"
              size="small"
              value={filters.fromDate}
              onChange={(e) => changeFilter("fromDate", e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="To Date"
              type="date"
              size="small"
              value={filters.toDate}
              onChange={(e) => changeFilter("toDate", e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department}
                label="Department"
                onChange={(e) => changeFilter("department", e.target.value)}
              >
                <MenuItem value="">All Departments</MenuItem>
                {dropdowns.departments.map((item) => (
                  <MenuItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={filters.level}
                label="Level"
                onChange={(e) => changeFilter("level", e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                {dropdowns.levels.map((item) => (
                  <MenuItem key={item} value={String(item)}>
                    Level {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Grade</InputLabel>
              <Select
                value={filters.grade}
                label="Grade"
                onChange={(e) => changeFilter("grade", e.target.value)}
              >
                <MenuItem value="">All Grades</MenuItem>
                {dropdowns.grades.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => changeFilter("status", e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.6,
              mt: 1,
              flexWrap: "wrap",
            }}
          >
            <Box
              component="span"
              sx={{ fontSize: 11, color: "#627D98", mr: 0.3 }}
            >
              Quick Range:
            </Box>
            <Chip
              label="Today"
              size="small"
              clickable
              onClick={() => setDateRange("today")}
            />
            <Chip
              label="7 Days"
              size="small"
              clickable
              onClick={() => setDateRange("7days")}
            />
            <Chip
              label="30 Days"
              size="small"
              clickable
              onClick={() => setDateRange("30days")}
            />
            <Chip
              label="This Month"
              size="small"
              clickable
              onClick={() => setDateRange("month")}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
            >
              RESET
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{
                backgroundColor: COLORS.primary,
                "&:hover": { backgroundColor: "#0B2942" },
              }}
            >
              SEARCH
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 1.2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <ToggleButtonGroup
            value={library}
            exclusive
            size="small"
            onChange={(_e, value) => value && setLibrary(value)}
          >
            <ToggleButton value="react">React Charts</ToggleButton>
            <ToggleButton value="amchart">AmCharts</ToggleButton>
            <ToggleButton value="apex">ApexCharts</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Row 1 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
            gap: 1.5,
          }}
        >
          {(["gauge", "status", "department"] as const).map((card) => {
            const reactRenderer = {
              gauge: renderReactGauge,
              status: renderReactStatus,
              department: renderReactDepartment,
            }[card];
            return (
              <ChartCard
                key={card}
                title={CARD_CONFIG[card].title}
                subtitle={CARD_CONFIG[card].subtitle}
                icon={CARD_CONFIG[card].icon}
                viewMode={viewModes[card]}
                onViewChange={(value) => changeView(card, value)}
              >
                {renderChart(card, amRefs[card], reactRenderer)}
              </ChartCard>
            );
          })}
        </Box>

        {/* Row 2 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
            gap: 1.5,
            mt: 1.5,
          }}
        >
          {(["grade", "date", "stacked"] as const).map((card) => {
            const reactRenderer = {
              grade: renderReactGrade,
              date: renderReactDate,
              stacked: renderReactStacked,
            }[card];
            return (
              <ChartCard
                key={card}
                title={CARD_CONFIG[card].title}
                subtitle={CARD_CONFIG[card].subtitle}
                icon={CARD_CONFIG[card].icon}
                viewMode={viewModes[card]}
                onViewChange={(value) => changeView(card, value)}
              >
                {renderChart(card, amRefs[card], reactRenderer)}
              </ChartCard>
            );
          })}
        </Box>

        {/* Row 3 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
            gap: 1.5,
            mt: 1.5,
          }}
        >
          <ChartCard
            title={CARD_CONFIG.summary.title}
            subtitle={CARD_CONFIG.summary.subtitle}
            icon={CARD_CONFIG.summary.icon}
            viewMode={viewModes.summary}
            onViewChange={(value) => changeView("summary", value)}
          >
            {renderChart("summary", amRefs.summary, renderReactSummary)}
          </ChartCard>
        </Box>

        <Dialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          fullWidth
          maxWidth="xl"
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: 800,
              color: COLORS.primary,
            }}
          >
            {detailTitle}
            <IconButton size="small" onClick={() => setDetailOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 1 }}>
            {detailLoading ? (
              <Box
                sx={{
                  minHeight: 250,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ height: "65vh", minHeight: 400 }}>
                <DesignationTable
                  data={detailRows}
                  columns={detailColumns}
                  loading={false}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailOpen(false)}>CLOSE</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Dashboard;
