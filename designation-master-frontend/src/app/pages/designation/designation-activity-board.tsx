
import { useEffect, useRef, useState } from "react";
import Dashboard from "./Dashboard";

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  IconButton,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useDispatch, useSelector } from "react-redux";
import type { MRT_ColumnDef } from "material-react-table";

import type { AppDispatch, RootState } from "../../../redux/store";
import {
  setDesignations,
  setLoading,
  setError,
} from "../../../redux/slices/designationSlice";

import Header from "../../layout/Header";
import Sidebar from "../../layout/Sidebar";
import Footer from "../../layout/Footer";

import DesignationFilters from "./designation-filters";
import DesignationTable, {
  TableText,
  StatusChip,
} from "../../components/react-table";
import AddForm from "./add-form";
import UpdateForm from "./update-form";
import ExcelUpload from "../../components/ExcelUpload";
import ExcelDownload from "../../components/ExcelDownload";

import {
  deleteDesignation,
  getDropdowns,
  saveDesignation,
  searchDesignations,
  updateDesignation,
  uploadDesignationAttachments,
  downloadDesignationAttachment,
  downloadDesignationExcel,
  getDesignationHistory,
  getDesignationAnalytics,
  type DesignationHistory,
} from "../../../api/DesignationApi";

import type {
  Designation,
  DesignationFormData,
  Option,
} from "../../../types/designation";
import { getAuthUser } from "../../../auth/auth";

interface DropdownData {
  departments: { id: number; name: string; status: boolean }[];
  levels: number[];
  grades: string[];
  statuses: boolean[];
  jobCategories: string[];
  employmentTypes: string[];
  skills: { id: number; name: string; status: boolean }[];
  branches: { id: number; name: string; status: boolean }[];
}

const EMPTY_DROPDOWNS: DropdownData = {
  departments: [],
  levels: [],
  grades: [],
  statuses: [],
  jobCategories: [],
  employmentTypes: [],
  skills: [],
  branches: [],
};

// "05-10-2026 13:47:06" -> "05-10-2026 01:47:06 PM"
const formatDateTime12h = (value: unknown): string => {
  if (!value) return "NA";
  const text = String(value).trim();
  const m = text.match(
    /^(\d{2}-\d{2}-\d{4})[\sT]+(\d{2}):(\d{2})(?::(\d{2}))?/,
  );
  if (!m) return text;
  const [, datePart, hh, mm, ss = "00"] = m;
  const hour24 = Number(hh);
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${datePart} ${String(hour12).padStart(2, "0")}:${mm}:${ss} ${suffix}`;
};

const toOptions = (values: unknown[]): Option[] =>
  values
    .filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
    .map((v) => ({ label: String(v), value: String(v) }));

const getDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getDefaultDateRange = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  return { fromDate: getDateString(start), toDate: getDateString(today) };
};

const DesignationActivityBoard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector((s: RootState) => s.designation.data);
  const loading = useSelector((s: RootState) => s.designation.loading);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<"designation" | "dashboard">(
    "designation",
  );
  const [selectedRow, setSelectedRow] = useState<Designation | null>(null);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [updateFormOpen, setUpdateFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [mode, setMode] = useState<"date" | "beginning">("date");
  const [tableMode, setTableMode] = useState<"date" | "beginning">("date");

  const [tileCounts, setTileCounts] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [sortBy, setSortBy] = useState<"name" | "code" | "level">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  // false = default order (newest record on top)
  const [userSorted, setUserSorted] = useState(false);

  // History
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState<DesignationHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [selectedDesignationId, setSelectedDesignationId] = useState<
    number | null
  >(null);

  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
  const searchRequestIdRef = useRef(0);

  const [dropdowns, setDropdowns] = useState<DropdownData>(EMPTY_DROPDOWNS);

  const initialDateRange = getDefaultDateRange();
  const [filters, setFilters] = useState({
    department: "",
    level: "",
    grade: "",
    status: "true",
    fromDate: initialDateRange.fromDate,
    toDate: initialDateRange.toDate,
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const showMessage = (
    message: string,
    severity: "success" | "error" = "success",
  ) => setSnackbar({ open: true, message, severity });

  const closeSnackbar = () => setSnackbar((p) => ({ ...p, open: false }));

  // ---------- Data loading ----------
  const loadData = async (filterValues?: typeof filters) => {
    const requestId = ++searchRequestIdRef.current;
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const result = await searchDesignations({
        departmentId: filterValues?.department
          ? Number(filterValues.department)
          : null,
        designationLevel: filterValues?.level
          ? Number(filterValues.level)
          : null,
        grade: filterValues?.grade || null,
        status: filterValues?.status ? filterValues.status === "true" : null,
        fromDate: filterValues?.fromDate || null,
        toDate: filterValues?.toDate || null,
        page: 0,
        size: 100,
      });

      if (requestId !== searchRequestIdRef.current) return;
      dispatch(setDesignations(Array.isArray(result) ? result : []));

      if (filterValues) {
        setAppliedFilters(filterValues);
        setAppliedSearchQuery(searchQuery);
      }
    } catch (error: any) {
      if (requestId !== searchRequestIdRef.current) return;
      console.error("SEARCH ERROR:", error);

      let errorMessage = "Unable to load designations";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errs = error.response.data.errors;
        errorMessage =
          typeof errs === "object"
            ? Object.values(errs).flat().join(", ")
            : errs;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(setDesignations([]));
      dispatch(setError(errorMessage));
      showMessage(errorMessage, "error");
    } finally {
      if (requestId === searchRequestIdRef.current) {
        dispatch(setLoading(false));
      }
    }
  };

  const loadDropdowns = async () => {
    try {
      const r = await getDropdowns();
      setDropdowns({
        departments: Array.isArray(r.departments) ? r.departments : [],
        levels: Array.isArray(r.levels) ? r.levels : [],
        grades: Array.isArray(r.grades) ? r.grades.map(String) : [],
        statuses: Array.isArray(r.statuses) ? r.statuses : [],
        jobCategories: Array.isArray(r.jobCategories)
          ? r.jobCategories.map(String)
          : [],
        employmentTypes: Array.isArray(r.employmentTypes)
          ? r.employmentTypes.map(String)
          : [],
        skills: Array.isArray(r.skills) ? r.skills : [],
        branches: Array.isArray(r.branches) ? r.branches : [],
      });
    } catch (error: any) {
      console.error("DROPDOWN ERROR:", error);
      showMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to load dropdowns",
        "error",
      );
    }
  };

  useEffect(() => {
    void loadDropdowns();
    void loadData();
  }, []);

  useEffect(() => {
    const loadTileCounts = async () => {
      try {
        const r = await getDesignationAnalytics({
          fromDate: mode === "date" ? filters.fromDate || null : null,
          toDate: mode === "date" ? filters.toDate || null : null,
          status: null,
        });
        setTileCounts({
          total: Number(r?.total) || 0,
          active: Number(r?.active) || 0,
          inactive: Number(r?.inactive) || 0,
        });
      } catch (error) {
        console.error("Count API error:", error);
        setTileCounts({ total: 0, active: 0, inactive: 0 });
      }
    };
    void loadTileCounts();
  }, [mode, filters.fromDate, filters.toDate, data]);

  // ---------- Handlers ----------
  const handleReset = () => {
    const r = getDefaultDateRange();
    const resetFilters = {
      department: "",
      level: "",
      grade: "",
      status: "true",
      fromDate: r.fromDate,
      toDate: r.toDate,
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSearchQuery("");
    setAppliedSearchQuery("");
    setSortBy("name");
    setSortDirection("asc");
    setUserSorted(false);
    void loadData(resetFilters);
  };

  const handleAdd = () => {
    setSelectedRow(null);
    setAddFormOpen(true);
  };

  const handleEdit = (row: Designation) => {
    setSelectedRow(row);
    setUpdateFormOpen(true);
  };

  const handleDelete = async (row: Designation) => {
    try {
      await deleteDesignation(row.id);
      dispatch(
        setDesignations(
          data.map((i) => (i.id === row.id ? { ...i, status: false } : i)),
        ),
      );
      await loadData();
      setHistoryLoaded(false);
      showMessage("Designation deleted successfully");
    } catch (error: any) {
      console.error("DELETE ERROR:", error);
      showMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to delete designation",
        "error",
      );
    }
  };

  const handleDownloadAttachment = async (attachment: any) => {
    try {
      await downloadDesignationAttachment(attachment);
      showMessage(`${attachment.fileName} downloaded`);
    } catch (error: any) {
      console.error("DOWNLOAD ERROR:", error);
      showMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to download file",
        "error",
      );
    }
  };

  const buildPayload = (form: DesignationFormData, isUpdate: boolean) => {
    const authUser = getAuthUser();
    return {
      ...(isUpdate ? { id: form.id } : {}),
      designationCode: form.designationCode.trim(),
      designationName: form.designationName.trim(),
      shortName: form.shortName.trim() || null,
      departmentId: Number(form.departmentId),
      designationLevel: Number(form.designationLevel),
      parentDesignationId: form.parentDesignation
        ? Number(form.parentDesignation.value)
        : null,
      jobCategory: form.jobCategory.trim(),
      employmentType:
        form.employmentType.length > 0 ? form.employmentType[0] : null,
      grade: form.grade.trim() || null,
      minExperience:
        form.minExperience !== "" ? Number(form.minExperience) : null,
      maxExperience:
        form.maxExperience !== "" ? Number(form.maxExperience) : null,
      description: form.description.trim() || null,
      skills: form.skills.map((s) => s.value),
      branchIds: form.branchIds,
      status: form.status === "true",
      attachments: null,
      remarks: form.remarks.trim() || null,
      ...(isUpdate
        ? { updatedBy: authUser?.userId }
        : { createdBy: authUser?.userId }),
    };
  };

  const handleAddSave = async (forms: DesignationFormData[]) => {
    if (!forms.length) return;
    try {
      const authUser = getAuthUser();
      if (!authUser) return showMessage("Please login first", "error");

      const saved = await saveDesignation(
        forms.map((f) => buildPayload(f, false)),
      );

      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        const rec = saved?.[i];
        if (form.attachments.length > 0 && rec?.id) {
          await uploadDesignationAttachments(rec.id, form.attachments);
        }
      }

      showMessage("Designation(s) added successfully");
      await loadData();
      setHistoryLoaded(false);
      setAddFormOpen(false);
    } catch (error: any) {
      showMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to save designation",
        "error",
      );
    }
  };

  const handleUpdateSave = async (forms: DesignationFormData[]) => {
    const form = forms[0];
    if (!form?.id) return;

    try {
      const authUser = getAuthUser();
      if (!authUser) return showMessage("Please login first", "error");

      const updated = await updateDesignation(buildPayload(form, true));
      if (form.attachments.length > 0 && updated?.id) {
        await uploadDesignationAttachments(updated.id, form.attachments);
      }

      showMessage("Designation updated successfully");
      await loadData();
      setHistoryLoaded(false);
      setUpdateFormOpen(false);
      setSelectedRow(null);
    } catch (error: any) {
      showMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to update designation",
        "error",
      );
    }
  };

  const handleHistory = async (row: Designation) => {
    setSelectedDesignationId(row.id);
    setHistoryOpen(true);
    if (historyLoaded) return;

    try {
      setHistoryLoading(true);
      const result = await getDesignationHistory();
      setHistoryRows(
        result.sort(
          (a, b) =>
            new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
        ),
      );
      setHistoryLoaded(true);
    } catch (error: any) {
      setHistoryRows([]);
      showMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to load history",
        "error",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTableDownload = async (sendToEmail = false) => {
    try {
      const result = await downloadDesignationExcel({
        departmentId: filters.department ? Number(filters.department) : null,
        designationLevel: filters.level ? Number(filters.level) : null,
        grade: filters.grade || null,
        status: filters.status === "" ? null : filters.status === "true",
        fromDate: filters.fromDate || null,
        toDate: filters.toDate || null,
        search: searchQuery.trim(),
        sendToEmail,
      });

      if (!result.downloaded || !result.blob) {
        showMessage(
          result.message || "Excel has been sent to your configured email",
        );
        return;
      }

      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.fileName || "designation-data.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showMessage("Excel downloaded successfully");
    } catch (error: any) {
      showMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to download Excel",
        "error",
      );
    }
  };

  const handleTableDownloadClick = () => {
    if (!filters.fromDate || !filters.toDate) {
      void handleTableDownload();
      return;
    }
    const from = new Date(`${filters.fromDate}T00:00:00`);
    const to = new Date(`${filters.toDate}T00:00:00`);
    const days =
      Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (days <= 7) {
      void handleTableDownload();
      return;
    }
    setDownloadConfirmOpen(true);
  };

  // ---------- Derived values ----------
  const convertToFormData = (
    row: Designation | null,
  ): DesignationFormData | undefined => {
    if (!row) return undefined;

    let employmentType: string[] = [];
    if (Array.isArray(row.employmentType)) {
      employmentType = row.employmentType.map(String);
    } else if (typeof row.employmentType === "string") {
      employmentType = row.employmentType
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }

    const skills: Option[] = Array.isArray(row.skills)
      ? row.skills.map((s) => ({
          label:
            dropdowns.skills.find((sk) => String(sk.id) === String(s))?.name ??
            String(s),
          value: String(s),
        }))
      : [];

    const branchIds: string[] = Array.isArray(row.branchIds)
      ? row.branchIds.map(String)
      : [];

    return {
      id: row.id,
      designationCode: row.designationCode ?? "",
      designationName: row.designationName ?? "",
      shortName: row.shortName ?? "",
      departmentId: String(row.departmentId ?? ""),
      designationLevel: String(row.designationLevel ?? ""),
      parentDesignation:
        row.parentDesignationId !== null &&
        row.parentDesignationId !== undefined
          ? {
              label: String(row.parentDesignationId),
              value: String(row.parentDesignationId),
            }
          : null,
      jobCategory: row.jobCategory ?? "",
      employmentType,
      grade: row.grade ?? "",
      minExperience:
        row.minExperience !== null && row.minExperience !== undefined
          ? String(row.minExperience)
          : "",
      maxExperience:
        row.maxExperience !== null && row.maxExperience !== undefined
          ? String(row.maxExperience)
          : "",
      description: row.description ?? "",
      skills,
      branchIds,
      status: row.status ? "true" : "false",
      attachments: [],
      remarks: row.remarks ?? "",
    };
  };

  const parseCreatedAt = (value: unknown): Date | null => {
    if (!value) return null;
    const text = String(value).trim();

    const m = text.match(
      /^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/,
    );
    if (m) {
      const [, day, month, year, hh = "00", mm = "00", ss = "00"] = m;
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hh),
        Number(mm),
        Number(ss),
      );
    }

    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const getBeginningDateRange = () => {
    const dates = data
      .map((item) => parseCreatedAt(item.createdAt))
      .filter((value): value is Date => value !== null)
      .map(
        (value) =>
          new Date(value.getFullYear(), value.getMonth(), value.getDate()),
      );

    if (!dates.length) return { fromDate: "", toDate: "" };

    const firstDate = new Date(
      Math.min(...dates.map((value) => value.getTime())),
    );
    const lastDate = new Date(
      Math.max(...dates.map((value) => value.getTime())),
    );

    return {
      fromDate: getDateString(firstDate),
      toDate: getDateString(lastDate),
    };
  };

  const isWithinAppliedRange = (item: Designation) => {
    if (!appliedFilters.fromDate && !appliedFilters.toDate) return true;

    const d = parseCreatedAt(item.createdAt);
    if (!d) return false;

    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    if (appliedFilters.fromDate) {
      if (day < new Date(`${appliedFilters.fromDate}T00:00:00`).getTime())
        return false;
    }
    if (appliedFilters.toDate) {
      if (day > new Date(`${appliedFilters.toDate}T00:00:00`).getTime())
        return false;
    }
    return true;
  };

  const matchesAppliedFilters = (item: Designation) => {
    if (tableMode === "date" && !isWithinAppliedRange(item)) return false;
    if (
      appliedFilters.department &&
      String(item.departmentId) !== appliedFilters.department
    )
      return false;
    if (
      appliedFilters.level &&
      String(item.designationLevel) !== appliedFilters.level
    )
      return false;
    if (
      appliedFilters.grade &&
      String(item.grade ?? "") !== appliedFilters.grade
    )
      return false;

    if (appliedSearchQuery.trim()) {
      const q = appliedSearchQuery.toLowerCase().trim();
      const ok =
        item.designationCode?.toLowerCase().includes(q) ||
        item.designationName?.toLowerCase().includes(q) ||
        item.shortName?.toLowerCase().includes(q) ||
        item.jobCategory?.toLowerCase().includes(q) ||
        item.employmentType?.toLowerCase().includes(q) ||
        item.grade?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.remarks?.toLowerCase().includes(q);
      if (!ok) return false;
    }
    return true;
  };

  const modeBaseData = data.filter(matchesAppliedFilters);
  const filteredDataBeforeSort = modeBaseData.filter((item) => {
    if (!appliedFilters.status) return true;
    return item.status === (appliedFilters.status === "true");
  });

  const compareValues = (a: Designation, b: Designation) => {
    if (!userSorted) return Number(b.id) - Number(a.id);
    if (sortBy === "level") {
      const aL = Number(a.designationLevel ?? 0);
      const bL = Number(b.designationLevel ?? 0);
      return sortDirection === "asc" ? aL - bL : bL - aL;
    }
    const aV = String(
      sortBy === "name" ? (a.designationName ?? "") : (a.designationCode ?? ""),
    );
    const bV = String(
      sortBy === "name" ? (b.designationName ?? "") : (b.designationCode ?? ""),
    );
    const r = aV.localeCompare(bV, undefined, {
      numeric: true,
      sensitivity: "base",
    });
    return sortDirection === "asc" ? r : -r;
  };

  const filteredData = [...filteredDataBeforeSort].sort(compareValues);

  const hasFilters = Boolean(
    filters.department ||
    filters.level ||
    filters.grade ||
    filters.status ||
    filters.fromDate ||
    filters.toDate,
  );

  // ---------- Options ----------
  const departmentOptions: Option[] = dropdowns.departments.map((d) => ({
    label: d.name,
    value: String(d.id),
  }));
  const designationLevelOptions: Option[] = dropdowns.levels.map((v) => ({
    label: `Level ${v}`,
    value: String(v),
  }));
  const gradeOptions = toOptions(dropdowns.grades);
  const jobCategoryOptions = toOptions(dropdowns.jobCategories);
  const employmentTypeOptions = toOptions(dropdowns.employmentTypes);
  const skillOptions: Option[] = dropdowns.skills.map((s) => ({
    label: s.name,
    value: String(s.id),
  }));
  const branchOptions: Option[] = dropdowns.branches.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));

  const parentDesignationOptions: Option[] = data
    .filter(
      (i) =>
        i.id !== selectedRow?.id &&
        (!selectedRow || i.departmentId === selectedRow.departmentId),
    )
    .map((i) => ({ label: i.designationName, value: String(i.id) }));

  const skillNameMap = new Map(
    dropdowns.skills.map((s) => [String(s.id), s.name]),
  );
  const branchNameMap = new Map(
    dropdowns.branches.map((b) => [String(b.id), b.name]),
  );

  const departmentNameMap = new Map(
    dropdowns.departments.map((d) => [String(d.id), d.name]),
  );
  const designationNameMap = new Map(
    data.map((d) => [String(d.id), d.designationName]),
  );

  // ---------- History helpers ----------
  const historyFields = [
    { key: "designationCode", label: "Designation Code" },
    { key: "designationName", label: "Designation Name" },
    { key: "shortName", label: "Short Name" },
    { key: "departmentId", label: "Department" },
    { key: "designationLevel", label: "Designation Level" },
    { key: "parentDesignationId", label: "Parent Designation" },
    { key: "jobCategory", label: "Job Category" },
    { key: "employmentType", label: "Employment Type" },
    { key: "grade", label: "Grade" },
    { key: "minExperience", label: "Min Experience" },
    { key: "maxExperience", label: "Max Experience" },
    { key: "description", label: "Description" },
    { key: "skills", label: "Skills" },
    { key: "branchIds", label: "Branches" },
    { key: "status", label: "Status" },
    { key: "remarks", label: "Remarks" },
  ] as const;

  type HistoryFieldKey = (typeof historyFields)[number]["key"];

  const selectedHistoryRows = historyRows
    .filter((i) => i.designationId === selectedDesignationId)
    .sort(
      (a, b) =>
        new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
    );

  const getHistoryValue = (
    item: DesignationHistory,
    key: HistoryFieldKey,
  ): unknown => item[key];

  const formatFilterDate = (value: string) => {
    if (!value) return "";
    const [y, m, d] = value.split("-");
    if (!y || !m || !d) return value;
    return `${d}-${m}-${y}`;
  };

  const formatHistoryValue = (
    value: unknown,
    key?: HistoryFieldKey,
  ): string => {
    if (value === null || value === undefined || value === "") return "NA";
    if (typeof value === "boolean") return value ? "Active" : "Inactive";
    if (Array.isArray(value)) {
      const nameMap =
        key === "skills"
          ? skillNameMap
          : key === "branchIds"
            ? branchNameMap
            : null;
      return value.length
        ? value.map((v) => nameMap?.get(String(v)) ?? String(v)).join(", ")
        : "NA";
    }
    if (key === "departmentId")
      return departmentNameMap.get(String(value)) ?? String(value);
    if (key === "parentDesignationId")
      return designationNameMap.get(String(value)) ?? String(value);
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const sameHistoryValue = (a: unknown, b: unknown): boolean =>
    JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

  const finalHistoryFields = historyFields.filter((f) =>
    selectedHistoryRows.some((item) => {
      const v = getHistoryValue(item, f.key);
      return v !== null && v !== undefined && v !== "";
    }),
  );

  const getHistoryActionedBy = (item: DesignationHistory): string => {
    const name =
      item.changedByName || (item.changedBy ? String(item.changedBy) : "Admin");
    if (item.action === "CREATE" || item.action === "ADDED")
      return `Created by ${name}`;
    if (item.action === "DELETE" || item.action === "DELETED")
      return `Deleted by ${name}`;
    return `Updated by ${name}`;
  };

  // ---------- Columns ----------
  const historyColumns: MRT_ColumnDef<DesignationHistory>[] = [
    {
      accessorKey: "changedAt",
      header: "Date & Time",
      size: 175,
      minSize: 175,
      Cell: ({ cell }) => (
        <TableText
          value={new Date(cell.getValue<string>()).toLocaleString()}
          align="center"
        />
      ),
    },
    {
      id: "actionedBy",
      header: "Actioned By",
      size: 155,
      minSize: 155,
      Cell: ({ row }) => {
        const action = row.original.action;
        const color =
          action === "CREATE" || action === "ADDED"
            ? "#16845B"
            : action === "DELETE" || action === "DELETED"
              ? "#D14343"
              : "#9A5527";
        return (
          <Typography
            sx={{ fontSize: 11, fontWeight: 800, color, whiteSpace: "nowrap" }}
          >
            {getHistoryActionedBy(row.original)}
          </Typography>
        );
      },
    },
    ...finalHistoryFields.map(
      (field): MRT_ColumnDef<DesignationHistory> => ({
        id: `history-${field.key}`,
        header: field.label,
        size: 190,
        minSize: 170,
        Cell: ({ row }) => {
          const current = row.original;
          const currentValue = getHistoryValue(current, field.key);

          if (current.action === "UPDATE") {
            const idx = selectedHistoryRows.findIndex(
              (i) => i.historyId === current.historyId,
            );
            const prev = selectedHistoryRows[idx + 1];
            const prevValue = prev
              ? getHistoryValue(prev, field.key)
              : undefined;
            const changed = prev
              ? !sameHistoryValue(prevValue, currentValue)
              : false;

            return (
              <Typography
                sx={{
                  fontSize: 11,
                  color: changed ? "#16845B" : "#222222",
                  fontWeight: changed ? 700 : 400,
                  whiteSpace: "nowrap",
                  maxWidth: 170,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={formatHistoryValue(currentValue, field.key)}
              >
                {formatHistoryValue(currentValue, field.key) || "—"}
              </Typography>
            );
          }

          return (
            <TableText
              value={formatHistoryValue(currentValue, field.key) || "—"}
              align="center"
              maxWidth={170}
            />
          );
        },
      }),
    ),
  ];

  const columns: MRT_ColumnDef<Designation>[] = [
    {
      accessorKey: "designationCode",
      header: "Code",
      size: 110,
      minSize: 110,
      Cell: ({ cell, row }) => (
        <Box
          component="span"
          onClick={() => void handleHistory(row.original)}
          sx={{
            cursor: "pointer",
            color: "#9A5527",
            fontWeight: 750,
            textDecoration: "underline",
          }}
        >
          {cell.getValue<string>()}
        </Box>
      ),
    },
    {
      accessorKey: "designationName",
      header: "Designation Name",
      size: 190,
      minSize: 190,
      Cell: ({ cell }) => (
        <TableText
          value={cell.getValue<string>()}
          align="left"
          maxWidth={175}
        />
      ),
    },
    {
      accessorKey: "shortName",
      header: "Short Name",
      size: 120,
      minSize: 120,
      Cell: ({ cell }) => (
        <TableText
          value={cell.getValue<string>()}
          align="left"
          maxWidth={105}
        />
      ),
    },
    {
      accessorKey: "departmentId",
      header: "Department",
      Cell: ({ cell }) =>
        dropdowns.departments.find((d) => d.id === cell.getValue<number>())
          ?.name || "",
    },
    {
      accessorKey: "designationLevel",
      header: "Level",
      size: 100,
      minSize: 100,
      Cell: ({ cell }) => {
        const v = cell.getValue<number>();
        return (
          <TableText
            value={v !== null && v !== undefined ? `Level ${v}` : "NA"}
            align="center"
          />
        );
      },
    },
    {
      accessorKey: "parentDesignationId",
      header: "Parent Designation",
      size: 170,
      minSize: 170,
      Cell: ({ cell }) => (
        <TableText value={cell.getValue<number>()} align="center" />
      ),
    },
    {
      accessorKey: "jobCategory",
      header: "Job Category",
      size: 150,
      minSize: 150,
      Cell: ({ cell }) => (
        <TableText
          value={cell.getValue<string>()}
          align="left"
          maxWidth={135}
        />
      ),
    },
    {
      accessorKey: "employmentType",
      header: "Employment Type",
      size: 155,
      minSize: 155,
      Cell: ({ cell }) => (
        <TableText
          value={cell.getValue<string>()}
          align="left"
          maxWidth={140}
        />
      ),
    },
    {
      accessorKey: "grade",
      header: "Grade",
      size: 100,
      minSize: 100,
      Cell: ({ cell }) => (
        <TableText value={cell.getValue<string>()} align="center" />
      ),
    },
    {
      accessorKey: "minExperience",
      header: "Min Experience",
      size: 125,
      minSize: 125,
      Cell: ({ cell }) => {
        const v = cell.getValue<number>();
        return (
          <TableText
            value={v !== null && v !== undefined ? `${v} yrs` : "NA"}
            align="center"
          />
        );
      },
    },
    {
      accessorKey: "maxExperience",
      header: "Max Experience",
      size: 125,
      minSize: 125,
      Cell: ({ cell }) => {
        const v = cell.getValue<number>();
        return (
          <TableText
            value={v !== null && v !== undefined ? `${v} yrs` : "NA"}
            align="center"
          />
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      size: 250,
      minSize: 250,
      Cell: ({ cell }) => (
        <TableText
          value={cell.getValue<string>()}
          maxWidth={225}
          align="left"
        />
      ),
    },
    {
      accessorKey: "skills",
      header: "Skills",
      size: 220,
      minSize: 220,
      Cell: ({ cell }) => {
        const skills = cell.getValue<string[]>() ?? [];
        return (
          <TableText
            value={
              skills.length
                ? skills
                    .map((id) => skillNameMap.get(String(id)) ?? String(id))
                    .join(", ")
                : "NA"
            }
            maxWidth={195}
            align="left"
          />
        );
      },
    },
    {
      accessorKey: "branchIds",
      header: "Branches",
      size: 180,
      minSize: 180,
      Cell: ({ cell }) => {
        const branches = cell.getValue<string[]>() ?? [];
        return (
          <TableText
            value={
              branches.length
                ? branches
                    .map((id) => branchNameMap.get(String(id)) ?? String(id))
                    .join(", ")
                : "NA"
            }
            maxWidth={155}
            align="left"
          />
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 110,
      minSize: 110,
      Cell: ({ cell }) => <StatusChip value={cell.getValue<boolean>()} />,
    },
    {
      accessorKey: "attachments",
      header: "Attachment",
      size: 180,
      minSize: 180,
      Cell: ({ cell }) => {
        const attachments = cell.getValue<Designation["attachments"]>() ?? [];
        if (!attachments.length) {
          return <TableText value="NA" align="left" maxWidth={150} />;
        }
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
            {attachments.map((a) => (
              <Box
                key={a.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  maxWidth: 170,
                }}
              >
                <Typography
                  variant="caption"
                  title={a.fileName}
                  sx={{
                    fontSize: "11px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 120,
                  }}
                >
                  {a.fileName}
                </Typography>
                <IconButton
                  type="button"
                  size="small"
                  title={`Download ${a.fileName}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    void handleDownloadAttachment(a);
                  }}
                  sx={{
                    padding: "3px",
                    color: "#89524E",
                    flexShrink: 0,
                    "&:hover": { backgroundColor: "#F9F0EF" },
                  }}
                >
                  <DownloadRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      size: 240,
      minSize: 240,
      Cell: ({ cell }) => (
        <TableText
          value={cell.getValue<string>()}
          maxWidth={215}
          align="left"
        />
      ),
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      size: 110,
      minSize: 110,
      Cell: ({ cell }) => (
        <TableText
          value={cell.getValue<number>()?.toString() ?? "NA"}
          align="center"
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      size: 170,
      minSize: 170,
      Cell: ({ cell }) => (
        <TableText
          value={formatDateTime12h(cell.getValue<string>())}
          align="center"
        />
      ),
    },
    {
      accessorKey: "updatedBy",
      header: "Updated By",
      size: 110,
      minSize: 110,
      Cell: ({ cell }) => (
        <TableText
          value={cell.getValue<number>()?.toString() ?? "NA"}
          align="center"
        />
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated Date",
      size: 170,
      minSize: 170,
      Cell: ({ cell }) => (
        <TableText
          value={formatDateTime12h(cell.getValue<string>())}
          align="center"
        />
      ),
    },
  ];

  // ---------- Render ----------
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, #F8F5F0 0%, #F4F7FB 48%, #EEF4FF 100%)",
        color: "#172B4D",
      }}
    >
      {/* <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <Box
        sx={{
          position: "fixed",
          top: 70,
          right: 20,
          zIndex: 1200,
        }}
      >
        <Tooltip title="Reload" placement="left" arrow>
          <IconButton
            onClick={() => window.location.reload()}
            aria-label="reload"
            sx={{
              width: 40,
              height: 40,
              color: "#123B63",
              border: "1px solid #D5DEE7",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 2px 8px rgba(11, 41, 66, 0.12)",
              "&:hover": {
                backgroundColor: "#E9EEF3",
                borderColor: "#B8C6D3",
                color: "#0B2942",
              },
            }}
          >
            <RefreshIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onDesignationClick={() => {
          setActivePage("designation");
          setSidebarOpen(false);
        }}
        onDashboardClick={() => {
          setActivePage("dashboard");
          setSidebarOpen(false);
        }}
      />

      {activePage === "dashboard" ? (
        <Box sx={{ flexGrow: 1, pt: 8 }}>
          <Dashboard />
        </Box>
      ) : (
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: 10,
            pb: 3,
            ml: sidebarOpen ? "240px" : 0,
            transition: "margin-left 0.2s ease",
            width: sidebarOpen ? "calc(100% - 240px)" : "100%",
          }}
        >
          <Container
            maxWidth="xl"
            sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, position: "relative" }}
          >
            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  color: "#163A5F",
                  fontSize: { xs: "20px", sm: "23px" },
                  fontWeight: 850,
                  letterSpacing: "-0.35px",
                  lineHeight: 1.2,
                }}
              >
                Designation Management
              </Typography>
              <Typography
                sx={{
                  mt: 0.3,
                  color: "#7A6F64",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Manage designation records, filters and status
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                mb: 1.5,
                p: 2,
                borderRadius: "12px",
                border: "1px solid #E5DCD3",
                background: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <DesignationFilters
                department={filters.department}
                level={filters.level}
                grade={filters.grade}
                status={filters.status}
                fromDate={
                  mode === "beginning"
                    ? getBeginningDateRange().fromDate
                    : filters.fromDate
                }
                toDate={
                  mode === "beginning"
                    ? getBeginningDateRange().toDate
                    : filters.toDate
                }
                departmentOptions={departmentOptions}
                designationLevelOptions={designationLevelOptions}
                gradeOptions={gradeOptions}
                statusOptions={[
                  { label: "Active", value: "true" },
                  { label: "Inactive", value: "false" },
                ]}
                activeCount={tileCounts.active}
                inactiveCount={tileCounts.inactive}
                totalCount={tileCounts.total}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onDepartmentChange={(v) =>
                  setFilters((p) => ({ ...p, department: v }))
                }
                onLevelChange={(v) => setFilters((p) => ({ ...p, level: v }))}
                onGradeChange={(v) => setFilters((p) => ({ ...p, grade: v }))}
                onStatusChange={(v) => {
                  setTableMode(mode);
                  setFilters((p) => ({ ...p, status: v }));
                  setAppliedFilters((p) => ({ ...p, status: v }));
                }}
                onFromDateChange={(v) =>
                  setFilters((p) => ({ ...p, fromDate: v }))
                }
                onToDateChange={(v) => setFilters((p) => ({ ...p, toDate: v }))}
                mode={mode}
                onModeChange={(value) => {
                  setMode(value);
                  if (value === "date") setTableMode("date");
                }}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortByChange={(value) => {
                  setUserSorted(true);
                  setSortBy(value);
                }}
                onSortDirectionChange={(value) => {
                  setUserSorted(true);
                  setSortDirection(value);
                }}
                onSearch={() => void loadData(filters)}
                onReset={handleReset}
              />
            </Paper>

            {hasFilters && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 0.8,
                  mb: 1.5,
                  p: 1.2,
                  borderRadius: "8px",
                  backgroundColor: "#F8F6F4",
                  border: "1px solid #E5DCD3",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6B5B4E",
                    mr: 0.5,
                  }}
                >
                  Filtered by:
                </Typography>

                {filters.department && (
                  <Chip
                    size="small"
                    label={`Department: ${filters.department}`}
                    onDelete={() =>
                      setFilters((p) => ({ ...p, department: "" }))
                    }
                  />
                )}
                {filters.level && (
                  <Chip
                    size="small"
                    label={`Level: ${filters.level}`}
                    onDelete={() => setFilters((p) => ({ ...p, level: "" }))}
                  />
                )}
                {filters.grade && (
                  <Chip
                    size="small"
                    label={`Grade: ${filters.grade}`}
                    onDelete={() => setFilters((p) => ({ ...p, grade: "" }))}
                  />
                )}
                {filters.status && (
                  <Chip
                    size="small"
                    label={`Status: ${
                      filters.status === "true" ? "Active" : "Inactive"
                    }`}
                    onDelete={() => setFilters((p) => ({ ...p, status: "" }))}
                  />
                )}
                {filters.fromDate && (
                  <Chip
                    size="small"
                    label={`From: ${formatFilterDate(filters.fromDate)}`}
                  />
                )}
                {filters.toDate && (
                  <Chip
                    size="small"
                    label={`To: ${formatFilterDate(filters.toDate)}`}
                  />
                )}

                <Box sx={{ flex: 1 }} />

                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#593D2B",
                    backgroundColor: "#FFF8F1",
                    border: "1px solid #DFC9B4",
                    borderRadius: "6px",
                    px: 1.5,
                    py: 0.7,
                  }}
                >
                  Records: {filteredData.length}
                </Typography>
              </Box>
            )}

            <Box sx={{ position: "relative" }}>
              <Paper
                elevation={0}
                sx={{
                  p: 0,
                  overflow: "hidden",
                  borderRadius: "12px",
                  border: "1px solid rgba(210, 199, 185, 0.78)",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 4px 12px rgba(48, 57, 69, 0.06)",
                }}
              >
                <DesignationTable
                  data={filteredData}
                  columns={columns}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </Paper>

              <Box
                sx={{
                  position: "fixed",
                  right: 0,
                  top: "calc(50% + 200px)",
                  transform: "translateY(-30%)",
                  zIndex: 1000,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  "& .MuiButton-root, & .MuiIconButton-root": {
                    background: "#163A5F !important",
                    color: "#FFFFFF !important",
                    borderColor: "#163A5F !important",
                  },
                  "& .MuiButton-root:hover, & .MuiIconButton-root:hover": {
                    background: "#051f37 !important",
                    color: "#FFFFFF !important",
                  },
                  "& .MuiSvgIcon-root": { color: "#FFFFFF !important" },
                }}
              >
                <Tooltip title="Add Designation" placement="left" arrow>
                  <IconButton
                    onClick={handleAdd}
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "10px",
                      color: "#FFFFFF",
                      background: "#163A5F !important",
                      boxShadow: "0 4px 12px rgba(22,58,95,0.24)",
                      "&:hover": {
                        background: "#0F2E4B !important",
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 16px rgba(22,58,95,0.30)",
                      },
                    }}
                  >
                    <AddRoundedIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                </Tooltip>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ExcelUpload
                    onSuccess={async () => {
                      await loadData();
                      setHistoryLoaded(false);
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ExcelDownload showMessage={showMessage} type="template" />
                </Box>

                <Tooltip title="Download Excel" placement="left" arrow>
                  <IconButton
                    onClick={handleTableDownloadClick}
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "10px",
                      color: "#FFFFFF",
                      background: "#163A5F !important",
                      boxShadow: "0 4px 12px rgba(22,58,95,0.24)",
                      "&:hover": {
                        background: "#0F2E4B !important",
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 16px rgba(22,58,95,0.30)",
                      },
                    }}
                  >
                    <DownloadRoundedIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      <Footer />

      <AddForm
        open={addFormOpen}
        onClose={() => {
          setAddFormOpen(false);
          setSelectedRow(null);
        }}
        onSave={handleAddSave}
        departmentOptions={departmentOptions}
        designationLevelOptions={designationLevelOptions}
        parentDesignationOptions={parentDesignationOptions}
        jobCategoryOptions={jobCategoryOptions}
        employmentTypeOptions={employmentTypeOptions}
        gradeOptions={gradeOptions}
        skillOptions={skillOptions}
        branchOptions={branchOptions}
      />

      {updateFormOpen && selectedRow && (
        <UpdateForm
          open={updateFormOpen}
          initialData={convertToFormData(selectedRow)!}
          onClose={() => {
            setUpdateFormOpen(false);
            setSelectedRow(null);
          }}
          onSave={handleUpdateSave}
          departmentOptions={departmentOptions}
          designationLevelOptions={designationLevelOptions}
          parentDesignationOptions={parentDesignationOptions}
          jobCategoryOptions={jobCategoryOptions}
          employmentTypeOptions={employmentTypeOptions}
          gradeOptions={gradeOptions}
          skillOptions={skillOptions}
          branchOptions={branchOptions}
        />
      )}

      {/* Download confirmation popup */}
      <Dialog
        open={downloadConfirmOpen}
        onClose={() => setDownloadConfirmOpen(false)}
        fullWidth
        maxWidth="sm"
        sx={{ "& .MuiDialog-paper": { borderRadius: "14px" } }}
      >
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{ fontSize: 18, fontWeight: 800, color: "#263238" }}
            >
              Send Excel to Mail
            </Typography>
            <IconButton
              size="small"
              onClick={() => setDownloadConfirmOpen(false)}
              sx={{ color: "#666" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography
            sx={{ mt: 1.5, fontSize: 14, color: "#666", lineHeight: 1.6 }}
          >
            The selected date range is more than 7 days. Do you want to send the
            Excel file to your configured email?
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 3,
            }}
          >
            <Button
              onClick={() => setDownloadConfirmOpen(false)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: "#666",
                minWidth: 70,
              }}
            >
              No
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setDownloadConfirmOpen(false);
                void handleTableDownload(true);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                minWidth: 70,
                backgroundColor: "#9D5F32",
                "&:hover": { backgroundColor: "#89502A" },
              }}
            >
              Yes
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* History popup */}
      <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        fullWidth
        maxWidth="xl"
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          },
        }}
      >
        <Box sx={{ backgroundColor: "#fff" }}>
          <Box
            sx={{
              px: 3,
              py: 2,
              backgroundColor: "#f7f8fa",
              borderBottom: "1px solid #e3e7ec",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                sx={{ fontSize: 18, fontWeight: 800, color: "#263238" }}
              >
                Designation History
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#707781", mt: 0.4 }}>
                Previous and new values for changed fields
              </Typography>
            </Box>
            <IconButton
              onClick={() => setHistoryOpen(false)}
              size="small"
              sx={{
                color: "#555",
                border: "1px solid #ddd",
                backgroundColor: "#fff",
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 2, maxHeight: "70vh", overflow: "auto" }}>
            {historyLoading ? (
              <Box
                sx={{
                  py: 8,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontSize: 13, color: "#777" }}>
                  Loading history...
                </Typography>
              </Box>
            ) : selectedHistoryRows.length === 0 ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <Typography
                  sx={{ fontSize: 14, fontWeight: 600, color: "#777" }}
                >
                  No history found
                </Typography>
              </Box>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  width: "100%",
                  overflow: "hidden",
                  border: "1px solid #E1E5EA",
                  borderRadius: "10px",
                }}
              >
                <DesignationTable
                  data={selectedHistoryRows}
                  columns={historyColumns}
                  loading={historyLoading}
                />
              </Paper>
            )}
          </Box>

          <Box
            sx={{
              px: 3,
              py: 1.5,
              borderTop: "1px solid #e3e7ec",
              display: "flex",
              justifyContent: "flex-end",
              backgroundColor: "#fafbfc",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setHistoryOpen(false)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 1.5,
                color: "#555",
                borderColor: "#ccc",
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={closeSnackbar}
          sx={{
            minWidth: 310,
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 750,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DesignationActivityBoard;
