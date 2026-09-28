import axiosInstance from "./axiosInstance";
import type { Designation } from "../types/designation";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  error: string;
}

export interface ExcelUploadResult {
  rowNumber: number;
  correctData: boolean;
  incorrectData: boolean;
  duplicateData: boolean;
  rowComment: string;
  action?: string;
  status?: string;
}

export interface NotificationResponse {
  id: number;
  subject: string;
  summary: string;
  recipient: string;
  createdAt: string;
  read: boolean;
  hasAttachment: boolean;
  attachmentName?: string | null;
  attachmentData?: string | null;
}

export interface AnalyticsChartData {
  label: string;
  value: number;
}
export interface DesignationAnalytics {
  total: number;
  active: number;
  inactive: number;
  activePercentage: number;
  gradeWise: AnalyticsChartData[];
  statusWise: AnalyticsChartData[];
  dateWise: AnalyticsChartData[];
  departmentWise: AnalyticsChartData[];
  levelWise: AnalyticsChartData[];
}

export interface Attachment {
  id: string;
  fileName: string;
  storedName: string;
  contentType?: string;
  fileSize?: number;
  url: string;
}

export interface DesignationHistory {
  historyId: number;
  designationId: number;
  designationCode: string;
  designationName: string;
  shortName?: string | null;
  departmentId: number;
  designationLevel?: number | null;
  parentDesignationId?: number | null;
  jobCategory?: string | null;
  employmentType?: string | null;
  grade?: string | null;
  minExperience?: number | null;
  maxExperience?: number | null;
  description?: string | null;
  skills?: string[] | null;
  branchIds?: string[] | null;
  status: boolean;
  attachments?: Record<string, unknown>[] | null;
  remarks?: string | null;
  createdBy?: number | null;
  createdByName?: string | null;
  createdAt?: string | null;
  updatedBy?: number | null;
  updatedByName?: string | null;
  updatedAt?: string | null;
  isDeleted: boolean;
  action: string;
  changedBy?: number | null;
  changedByName?: string | null;
  changedAt: string;
}

export const getDesignations = async (
  page = 0,
  size = 10,
  sortBy = "id",
  direction = "asc",
  status?: boolean,
) => {
  const response = await axiosInstance.get<
    ApiResponse<{
      content: Designation[];
      totalElements: number;
      totalPages: number;
    }>
  >("/designation/list", { params: { page, size, sortBy, direction, status } });
  return response.data.data;
};

export const getDesignationById = async (id: number) =>
  (await axiosInstance.get<ApiResponse<Designation>>(`/designation/${id}`)).data
    .data;

export const saveDesignation = async (data: object[]) =>
  (
    await axiosInstance.post<ApiResponse<Designation[]>>(
      "/designation/save",
      data,
    )
  ).data.data;

export const updateDesignation = async (data: object) =>
  (
    await axiosInstance.put<ApiResponse<Designation>>(
      "/designation/update",
      data,
    )
  ).data.data;
export const deleteDesignation = async (id: number) =>
  (await axiosInstance.delete<ApiResponse<void>>(`/designation/delete/${id}`))
    .data;
export const getDesignationCount = async (status?: boolean) =>
  (
    await axiosInstance.get<ApiResponse<number>>("/designation/count", {
      params: { status },
    })
  ).data.data;
export const searchDesignations = async (params: object) =>
  (
    await axiosInstance.get<ApiResponse<Designation[]>>("/designation/search", {
      params,
    })
  ).data.data;

export const getDropdowns = async () =>
  (
    await axiosInstance.get<
      ApiResponse<{
        departments: { id: number; name: string; status: boolean }[];
        levels: number[];
        grades: string[];
        statuses: boolean[];
        jobCategories: string[];
        employmentTypes: string[];
        skills: { id: number; name: string; status: boolean }[];
        branches: { id: number; name: string; status: boolean }[];
      }>
    >("/designation/dropdowns")
  ).data.data;

export const uploadDesignationExcel = async (
  file: File,
): Promise<ExcelUploadResult[]> => {
  const formData = new FormData();
  formData.append("file", file);
  return (
    await axiosInstance.post<ApiResponse<ExcelUploadResult[]>>(
      "/designation/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    )
  ).data.data;
};

export const importDesignationExcel = async (
  file: File,
): Promise<ExcelUploadResult[]> => {
  const formData = new FormData();
  formData.append("file", file);
  return (
    await axiosInstance.post<ApiResponse<ExcelUploadResult[]>>(
      "/designation/import",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    )
  ).data.data;
};

export const downloadDesignationTemplate = async (): Promise<Blob> =>
  (
    await axiosInstance.get<Blob>("/designation/template", {
      responseType: "blob",
    })
  ).data;

export const downloadDesignationExcel = async (
  params: {
    departmentId?: number | null;
    designationLevel?: number | null;
    grade?: string | null;
    status?: boolean | null;
    fromDate?: string | null;
    toDate?: string | null;
    search?: string;
    sendToEmail?: boolean;
  } = {},
) => {
  const response = await axiosInstance.get("/designation/download", {
    params,
    responseType: "blob",
    validateStatus: (status) => status >= 200 && status < 300,
  });

  const blob = response.data as Blob;

  const text = await blob.text();

  if (text.trim().startsWith("{")) {
    const body = JSON.parse(text) as ApiResponse<null>;

    return {
      downloaded: false,
      message: body.message || "Excel has been sent to your configured email",
    };
  }
  
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = new Date();
  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const timestamp =
    `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}` +
    `_${pad(hours12)}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-${ampm}`;

  return {
    downloaded: true,
    blob,
    fileName: `designation_${timestamp}.xlsx`,
  };
};

export const getDesignationHistory = async (): Promise<DesignationHistory[]> =>
  (
    await axiosInstance.get<ApiResponse<DesignationHistory[]>>(
      "/designation/history",
    )
  ).data.data ?? [];

export const getNotifications = async (page = 0, size = 10) =>
  (
    await axiosInstance.get<
      ApiResponse<{
        content: NotificationResponse[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      }>
    >("/designation/notifications", { params: { page, size } })
  ).data.data;

export const getDesignationAnalytics = async (
  params?: object,
): Promise<DesignationAnalytics> =>
  (
    await axiosInstance.get<ApiResponse<DesignationAnalytics>>(
      "/designation/analytics",
      { params },
    )
  ).data.data;

export const uploadDesignationAttachments = async (
  id: number,
  files: File[],
) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return (
    await axiosInstance.post<ApiResponse<Designation>>(
      `/designation/${id}/attachments`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    )
  ).data.data;
};

export const downloadDesignationAttachment = async (
  attachment: Attachment,
): Promise<void> => {
  const cleanUrl = attachment.url.replace(/^https?:\/\/[^/]+/, "");
  const response = await axiosInstance.get<Blob>(cleanUrl, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

export const getDesignationExcelHeaders = async (): Promise<string[]> =>
  (await axiosInstance.get<ApiResponse<string[]>>("/designation/excel-headers"))
    .data.data;
