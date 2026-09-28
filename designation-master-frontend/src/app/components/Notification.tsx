
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  List,
  ListItemButton,
  Paper,
  Tooltip,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  getNotifications,
  type NotificationResponse,
} from "../../api/DesignationApi";
import { latestDownloadedExcel } from "./ExcelDownload";

interface NotificationProps {
  onClosePanel?: () => void;
}

interface DownloadedExcel {
  file: Blob;
  fileName: string;
}

interface NotificationWithAttachment extends NotificationResponse {
  localFile?: Blob | null;
  localFileName?: string | null;
}

interface NotificationPage {
  content: NotificationWithAttachment[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

const Notification = ({ onClosePanel }: NotificationProps) => {
  const [notifications, setNotifications] = useState<
    NotificationWithAttachment[]
  >(() => {
    try {
      const cached = sessionStorage.getItem("cachedNotifications");
      if (cached) {
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed)
          ? parsed.map((n: any) => ({ ...n, localFile: null }))
          : [];
      }
    } catch {
      /* ignore */
    }
    return [];
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationWithAttachment | null>(null);
  const [open, setOpen] = useState(false);
  const [downloadedExcel, setDownloadedExcel] =
    useState<DownloadedExcel | null>(
      latestDownloadedExcel
        ? {
            file: latestDownloadedExcel.file,
            fileName: latestDownloadedExcel.fileName,
          }
        : null,
    );

  const loadingRef = useRef(false);
  const loadedPagesRef = useRef<Set<number>>(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const handleExcelDownloaded = (event: Event) => {
      const customEvent = event as CustomEvent<DownloadedExcel>;

      if (!customEvent.detail?.file) {
        return;
      }

      const file = customEvent.detail.file;
      const fileName = customEvent.detail.fileName || "designation.xlsx";

      setDownloadedExcel({
        file,
        fileName,
      });

      setNotifications((current) =>
        current.map((notification) =>
          notification.hasAttachment
            ? {
                ...notification,
                localFile: file,
                localFileName: fileName,
              }
            : notification,
        ),
      );

      setSelectedNotification((current) =>
        current && current.hasAttachment
          ? {
              ...current,
              localFile: file,
              localFileName: fileName,
            }
          : current,
      );
    };

    window.addEventListener(
      "designation-excel-downloaded",
      handleExcelDownloaded,
    );

    return () => {
      mountedRef.current = false;

      window.removeEventListener(
        "designation-excel-downloaded",
        handleExcelDownloaded,
      );
    };
  }, []);

  const attachmentFromNotification = (
    notification: NotificationResponse,
  ): { file: Blob | null; fileName: string | null } => {
    if (!notification.hasAttachment || !notification.attachmentData) {
      return { file: null, fileName: notification.attachmentName ?? null };
    }
    try {
      const bytes = Uint8Array.from(atob(notification.attachmentData), (char) =>
        char.charCodeAt(0),
      );
      return {
        file: new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        fileName: notification.attachmentName ?? "Designation.xlsx",
      };
    } catch {
      return { file: null, fileName: notification.attachmentName ?? null };
    }
  };

  const loadNotifications = async (requestedPage: number) => {
    if (
      loadingRef.current ||
      requestedPage < 0 ||
      loadedPagesRef.current.has(requestedPage)
    ) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setError("");

      const result = (await getNotifications(
        requestedPage,
        10,
      )) as unknown as NotificationPage;

      if (!mountedRef.current) {
        return;
      }

      const content = (result?.content ?? []).map((notification) => {
        const attachment = attachmentFromNotification(notification);
        return {
          ...notification,
          localFile:
            attachment.file ??
            (notification.hasAttachment && latestDownloadedExcel
              ? latestDownloadedExcel.file
              : null),
          localFileName:
            attachment.fileName ??
            (notification.hasAttachment && latestDownloadedExcel
              ? latestDownloadedExcel.fileName
              : null),
        };
      });

      loadedPagesRef.current.add(requestedPage);

      setNotifications(content);
      setTotalPages(result?.totalPages ?? 0);
      setPage(result?.number ?? requestedPage);

      try {
        sessionStorage.setItem(
          "cachedNotifications",
          JSON.stringify(content.map((n) => ({ ...n, localFile: null }))),
        );
      } catch {
        /* ignore */
      }
    } catch (err) {
      loadedPagesRef.current.delete(requestedPage);

      console.error("Notification API error:", err);

      if (mountedRef.current) {
        setError("Unable to load notifications.");
      }
    } finally {
      loadingRef.current = false;

      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadNotifications(0);
  }, []);

  const handleNotificationClick = (
    notification: NotificationWithAttachment,
  ) => {
    let file = notification.localFile;
    let fileName = notification.localFileName;

    if (!file && notification.hasAttachment) {
      const attachment = attachmentFromNotification(notification);
      file = attachment.file;
      fileName = attachment.fileName;
    }
    if (!file && notification.hasAttachment && latestDownloadedExcel) {
      file = latestDownloadedExcel.file;
      fileName = latestDownloadedExcel.fileName;
    }

    const updatedNotification: NotificationWithAttachment = {
      ...notification,
      read: true,
      localFile: file,
      localFileName: fileName,
    };

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? updatedNotification : item,
      ),
    );

    setSelectedNotification(updatedNotification);
    setOpen(true);
  };

  const handleToggleRead = () => {
    if (!selectedNotification) {
      return;
    }

    const updatedNotification: NotificationWithAttachment = {
      ...selectedNotification,
      read: !selectedNotification.read,
    };

    setSelectedNotification(updatedNotification);

    setNotifications((current) =>
      current.map((item) =>
        item.id === updatedNotification.id ? updatedNotification : item,
      ),
    );
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedNotification(null);
    onClosePanel?.();
  };

  const handleDownloadAttachment = () => {
    if (!selectedNotification?.hasAttachment) {
      return;
    }

    const file =
      selectedNotification.localFile ||
      downloadedExcel?.file ||
      latestDownloadedExcel?.file;

    const fileName =
      selectedNotification.localFileName ||
      downloadedExcel?.fileName ||
      latestDownloadedExcel?.fileName ||
      selectedNotification.attachmentName ||
      "designation.xlsx";

    if (!file) {
      setError("Downloaded Excel file is not available.");
      return;
    }

    try {
      setError("");

      const url = window.URL.createObjectURL(file);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = fileName;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error("Attachment download failed:", err);
      setError("Unable to download attachment.");
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      void loadNotifications(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      void loadNotifications(page + 1);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const formatDate = (date: string) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderSummary = (summary: string) => {
    if (!summary) {
      return (
        <Box
          sx={{
            color: "#64748B",
            fontSize: 14,
            lineHeight: 1.8,
          }}
        >
          No summary available.
        </Box>
      );
    }

    const lines = summary
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return (
      <Box>
        {lines.map((line, index) => {
          const separatorIndex = line.indexOf(":");

          if (separatorIndex > 0) {
            const label = line.substring(0, separatorIndex).trim();
            const value = line.substring(separatorIndex + 1).trim();

            return (
              <Box
                key={`${index}-${label}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  minHeight: 38,
                  borderBottom:
                    index < lines.length - 1 ? "1px solid #E2E8F0" : "none",
                }}
              >
                <Box
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#64748B",
                  }}
                >
                  {label}
                </Box>

                <Box
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1E293B",
                    textAlign: "right",
                  }}
                >
                  {value}
                </Box>
              </Box>
            );
          }

          return (
            <Box
              key={`${index}-${line}`}
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: "#334155",
                lineHeight: 1.7,
                py: 0.5,
              }}
            >
              {line}
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          width: {
            xs: 350,
            sm: 430,
          },
          maxWidth: "calc(100vw - 24px)",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #D9E2EC",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E2E8F0",
            backgroundColor: "#F8FAFC",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
            }}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              {unreadCount > 0 ? (
                <NotificationsActiveIcon
                  sx={{
                    color: "#123B63",
                    fontSize: 23,
                  }}
                />
              ) : (
                <NotificationsNoneIcon
                  sx={{
                    color: "#123B63",
                    fontSize: 23,
                  }}
                />
              )}
            </Badge>

            <Box
              sx={{
                fontSize: 17,
                fontWeight: 700,
                color: "#123B63",
              }}
            >
              Notifications
            </Box>
          </Box>

          <Box
            sx={{
              fontSize: 12,
              color: "#64748B",
            }}
          >
            {notifications.length} message
            {notifications.length !== 1 ? "s" : ""}
          </Box>
        </Box>

        {error && (
          <Box sx={{ p: 1.5 }}>
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          </Box>
        )}

        {loading ? (
          <Box
            sx={{
              height: 180,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box
            sx={{
              height: 180,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              color: "#64748B",
            }}
          >
            <NotificationsNoneIcon
              sx={{
                fontSize: 42,
                color: "#CBD5E1",
              }}
            />

            <Box
              sx={{
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              No notifications
            </Box>
          </Box>
        ) : (
          <>
            <List
              disablePadding
              sx={{
                maxHeight: 460,
                overflowY: "auto",
              }}
            >
              {notifications.map((notification) => (
                <Box key={notification.id}>
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      px: 2,
                      py: 1.6,
                      alignItems: "flex-start",
                      backgroundColor: notification.read
                        ? "#FFFFFF"
                        : "#F1F7FC",
                      "&:hover": {
                        backgroundColor: "#EAF2F8",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        mr: 1.5,
                        backgroundColor: notification.read
                          ? "#E2E8F0"
                          : "#DCEAF7",
                        color: "#123B63",
                      }}
                    >
                      {notification.read ? (
                        <MarkEmailReadIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <MarkEmailUnreadIcon sx={{ fontSize: 20 }} />
                      )}
                    </Avatar>

                    <Box
                      sx={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            fontSize: 14,
                            fontWeight: notification.read ? 600 : 700,
                            color: "#1E293B",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {notification.subject}
                        </Box>

                        {!notification.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              minWidth: 8,
                              borderRadius: "50%",
                              backgroundColor: "#1976D2",
                              mt: 0.7,
                            }}
                          />
                        )}
                      </Box>

                      <Box
                        sx={{
                          mt: 0.5,
                          fontSize: 12,
                          color: "#64748B",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {notification.summary}
                      </Box>

                      <Box
                        sx={{
                          mt: 0.8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box
                          sx={{
                            fontSize: 11,
                            color: "#94A3B8",
                          }}
                        >
                          {formatDate(notification.createdAt)}
                        </Box>

                        {notification.hasAttachment && (
                          <AttachFileIcon
                            sx={{
                              fontSize: 16,
                              color: "#64748B",
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </ListItemButton>

                  <Divider />
                </Box>
              ))}
            </List>

            <Box
              sx={{
                height: 48,
                px: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
              }}
            >
              <Box
                sx={{
                  fontSize: 12,
                  color: "#64748B",
                }}
              >
                Page {page + 1} of {Math.max(totalPages, 1)}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <IconButton
                  size="small"
                  disabled={page <= 0 || loading}
                  onClick={handlePreviousPage}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  disabled={
                    page >= totalPages - 1 || totalPages === 0 || loading
                  }
                  onClick={handleNextPage}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              overflow: "hidden",
            },
          },
        }}
      >
        {selectedNotification && (
          <>
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                backgroundColor: "#123B63",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#FFFFFF",
                    color: "#123B63",
                  }}
                >
                  <MarkEmailReadIcon />
                </Avatar>

                <Box>
                  <Box
                    sx={{
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    Notification
                  </Box>

                  <Box
                    sx={{
                      fontSize: 12,
                      opacity: 0.8,
                    }}
                  >
                    Designation Master
                  </Box>
                </Box>
              </Box>

              <IconButton onClick={handleClose} sx={{ color: "#FFFFFF" }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <DialogContent
              sx={{
                p: 0,
                backgroundColor: "#F8FAFC",
              }}
            >
              <Box
                sx={{
                  mx: { xs: 0, sm: 3 },
                  my: { xs: 0, sm: 3 },
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: { xs: 0, sm: "10px" },
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
                    pt: 3,
                    pb: 2,
                  }}
                >
                  <Box
                    sx={{
                      fontSize: { xs: 20, sm: 24 },
                      fontWeight: 700,
                      color: "#0F172A",
                      lineHeight: 1.3,
                    }}
                  >
                    {selectedNotification.subject}
                  </Box>
                </Box>

                <Divider />

                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "80px 1fr",
                    },
                    rowGap: 1,
                    columnGap: 1,
                  }}
                >
                  <Box
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#64748B",
                    }}
                  >
                    From
                  </Box>

                  <Box
                    sx={{
                      fontSize: 13,
                      color: "#334155",
                    }}
                  >
                    Designation Master System
                  </Box>

                  <Box
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#64748B",
                    }}
                  >
                    To
                  </Box>

                  <Box
                    sx={{
                      fontSize: 13,
                      color: "#334155",
                    }}
                  >
                    {selectedNotification.recipient}
                  </Box>

                  <Box
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#64748B",
                    }}
                  >
                    Date
                  </Box>

                  <Box
                    sx={{
                      fontSize: 13,
                      color: "#334155",
                    }}
                  >
                    {formatDate(selectedNotification.createdAt)}
                  </Box>

                  <Box
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#64748B",
                    }}
                  >
                    Status
                  </Box>

                  <Box
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: selectedNotification.read ? "#15803D" : "#DC2626",
                    }}
                  >
                    {selectedNotification.read ? "Read" : "Unread"}
                  </Box>
                </Box>

                <Divider />

                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: 3,
                  }}
                >
                  <Box
                    sx={{
                      mb: 2,
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#123B63",
                    }}
                  >
                    Summary
                  </Box>

                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2.5 },
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      backgroundColor: "#F8FAFC",
                    }}
                  >
                    {renderSummary(selectedNotification.summary)}
                  </Box>
                </Box>

                {selectedNotification.hasAttachment && (
                  <>
                    <Divider />

                    <Box
                      sx={{
                        px: { xs: 2, sm: 3 },
                        py: 2.5,
                      }}
                    >
                      <Box
                        sx={{
                          mb: 1.3,
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#334155",
                        }}
                      >
                        Attachment
                      </Box>

                      <Box
                        sx={{
                          p: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          border: "1px solid #CBD5E1",
                          borderRadius: "8px",
                          backgroundColor: "#FFFFFF",
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                          }}
                        >
                          <AttachFileIcon
                            sx={{
                              color: "#123B63",
                              fontSize: 23,
                            }}
                          />

                          <Box sx={{ minWidth: 0 }}>
                            <Box
                              sx={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#334155",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {selectedNotification.localFileName ||
                                downloadedExcel?.fileName ||
                                selectedNotification.attachmentName ||
                                "designation.xlsx"}
                            </Box>

                            <Box
                              sx={{
                                fontSize: 11,
                                color: "#94A3B8",
                              }}
                            >
                              Excel attachment
                            </Box>
                          </Box>
                        </Box>

                        <Tooltip title="Download attachment">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadAttachment}
                            disabled={
                              !selectedNotification.localFile &&
                              !downloadedExcel &&
                              !latestDownloadedExcel
                            }
                            sx={{
                              flexShrink: 0,
                              textTransform: "none",
                              borderRadius: "6px",
                              fontWeight: 600,
                            }}
                          >
                            Download
                          </Button>
                        </Tooltip>
                      </Box>
                    </Box>
                  </>
                )}

                <Divider />

                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleToggleRead}
                    startIcon={
                      selectedNotification.read ? (
                        <MarkEmailUnreadIcon />
                      ) : (
                        <MarkEmailReadIcon />
                      )
                    }
                    sx={{
                      textTransform: "none",
                      borderRadius: "6px",
                    }}
                  >
                    {selectedNotification.read
                      ? "Mark as Unread"
                      : "Mark as Read"}
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleClose}
                    sx={{
                      textTransform: "none",
                      borderRadius: "6px",
                      px: 3,
                    }}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
};

export default Notification;