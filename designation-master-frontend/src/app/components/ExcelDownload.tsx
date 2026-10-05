import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";

import axiosInstance from "../../api/axiosInstance";

interface ExcelDownloadProps {
  showMessage: (message: string, severity?: "success" | "error") => void;
  type?: "excel" | "template";
}

export interface DownloadedExcelFile {
  file: Blob;
  fileName: string;
}

export let latestDownloadedExcel: DownloadedExcelFile | null = null;
// Timestamp: YYYY-MM-DD_HH-MM-SS
const getTimestamp = (): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = new Date();
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
  );
};

const ExcelDownload = ({ showMessage, type = "excel" }: ExcelDownloadProps) => {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const downloadExcel = async (template: boolean) => {
    try {
      setDownloading(true);

      const response = await axiosInstance.get(
        template ? "/designation/template" : "/designation/download",
        { responseType: "blob" },
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = template
        ? `designation_template_${getTimestamp()}.xlsx`
        : `designation_${getTimestamp()}.xlsx`;

      if (!template) {
        latestDownloadedExcel = {
          file: blob,
          fileName,
        };

        window.dispatchEvent(
          new CustomEvent("designation-excel-downloaded", {
            detail: {
              file: blob,
              fileName,
            },
          }),
        );
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setOpen(false);

      showMessage(
        template
          ? "Template downloaded successfully"
          : "Excel downloaded successfully",
        "success",
      );
    } catch (error) {
      console.error("EXCEL DOWNLOAD ERROR:", error);

      showMessage(
        template ? "Unable to download template" : "Unable to download Excel",
        "error",
      );
    } finally {
      setDownloading(false);
    }
  };

  if (type === "excel") {
    return (
      <>
        <Tooltip title="Download Excel" placement="left" arrow>
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              width: 42,
              height: 42,
              borderRadius: "10px",
              color: "#315B85",
              backgroundColor: "#EEF4FB",
              border: "1px solid #D3E1EF",
              "&:hover": {
                backgroundColor: "#E3EDF7",
                transform: "scale(1.05)",
                boxShadow: "0 4px 12px rgba(49,91,133,0.2)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <FileDownloadRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Tooltip>

        <Dialog
          open={open}
          onClose={() => !downloading && setOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              color: "#163A5F",
              fontSize: 18,
            }}
          >
            Download Excel
          </DialogTitle>

          <DialogContent>
            <Typography sx={{ fontSize: "13px", color: "#667085" }}>
              Download the Excel file with all designation records.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              variant="outlined"
              disabled={downloading}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              disabled={downloading}
              onClick={() => downloadExcel(false)}
              startIcon={<FileDownloadRoundedIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "8px",
              }}
            >
              {downloading ? "Downloading..." : "Download Excel"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Tooltip title="Download Template" placement="left" arrow>
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            width: 42,
            height: 42,
            borderRadius: "10px",
            color: "#6B4E71",
            backgroundColor: "#F3EEF5",
            border: "1px solid #D8CEE0",
            "&:hover": {
              backgroundColor: "#EBE2EF",
              transform: "scale(1.05)",
              boxShadow: "0 4px 12px rgba(107,78,113,0.2)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <DescriptionRoundedIcon sx={{ fontSize: 22 }} />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => !downloading && setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#163A5F",
            fontSize: 18,
          }}
        >
          Download Template
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ fontSize: "13px", color: "#667085" }}>
            Download the Excel template for uploading designation records.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            disabled={downloading}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={downloading}
            onClick={() => downloadExcel(true)}
            startIcon={<DescriptionRoundedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "8px",
              backgroundColor: "#6B4E71",
              "&:hover": {
                backgroundColor: "#5A3E60",
              },
            }}
          >
            {downloading ? "Downloading..." : "Download Template"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExcelDownload;
