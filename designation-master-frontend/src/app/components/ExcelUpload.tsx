// import { useEffect, useRef, useState } from "react";
// import type { ChangeEvent } from "react";
// import {
//   Alert,
//   Box,
//   Button,
//   Chip,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   IconButton,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Tooltip,
//   Typography,
// } from "@mui/material";
// import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
// import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
// import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
// import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
// import CloseIcon from "@mui/icons-material/Close";
// import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
// import * as XLSX from "xlsx";
// import type { MRT_ColumnDef } from "material-react-table";
// import DesignationTable, { TableText } from "./react-table";
// import {
//   uploadDesignationExcel,
//   importDesignationExcel,
//   getDesignationExcelHeaders,
// } from "../../api/DesignationApi";

// interface ExcelUploadResult {
//   rowNumber: number;
//   correctData: boolean;
//   incorrectData: boolean;
//   duplicateData: boolean;
//   rowComment: string;
// }

// interface ExcelRow {
//   rowNumber: number;
//   data: Record<string, string>;
// }

// interface ExcelUploadProps {
//   onSuccess: () => void | Promise<void>;
// }

// type ResultType = "correct" | "incorrect" | "duplicate";

// const COLUMN_WIDTHS: Record<string, number> = {
//   Description: 240,
//   Skills: 180,
//   Remarks: 180,
// };
// const DEFAULT_COLUMN_WIDTH = 140;
// const colWidth = (header: string) =>
//   COLUMN_WIDTHS[header] ?? DEFAULT_COLUMN_WIDTH;

// const RESULT_META: Record<ResultType, { title: string; color: string }> = {
//   correct: { title: "Correct", color: "#027A48" },
//   incorrect: { title: "Invalid", color: "#B42318" },
//   duplicate: { title: "Duplicate", color: "#B54708" },
// };

// const RESULT_ICONS: Record<ResultType, React.ReactNode> = {
//   correct: <CheckCircleRoundedIcon sx={{ color: "#12B76A", fontSize: 21 }} />,
//   incorrect: <ErrorRoundedIcon sx={{ color: "#D92D20", fontSize: 21 }} />,
//   duplicate: <ContentCopyRoundedIcon sx={{ color: "#D97706", fontSize: 21 }} />,
// };

// const cellSx = (w: number, h: number) => ({
//   width: `${w}px !important`,
//   minWidth: `${w}px !important`,
//   maxWidth: `${w}px !important`,
//   height: `${h}px !important`,
//   minHeight: `${h}px !important`,
//   maxHeight: `${h}px !important`,
// });

// const ExcelUpload = ({ onSuccess }: ExcelUploadProps) => {
//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const [selectDialogOpen, setSelectDialogOpen] = useState(false);
//   const [resultDialogOpen, setResultDialogOpen] = useState(false);
//   const [selectedResultType, setSelectedResultType] =
//     useState<ResultType | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [excelRows, setExcelRows] = useState<ExcelRow[]>([]);
//   const [results, setResults] = useState<ExcelUploadResult[]>([]);
//   const [fileName, setFileName] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [excelHeaders, setExcelHeaders] = useState<string[]>([]);

//   const correctCount = results.filter((r) => r.correctData).length;
//   const incorrectCount = results.filter((r) => r.incorrectData).length;
//   const duplicateCount = results.filter((r) => r.duplicateData).length;
//   const totalRows = excelRows.length;
//   const isValidated = results.length > 0;
//   const hasErrors = incorrectCount > 0 || duplicateCount > 0;
//   const hasCorrectRows = correctCount > 0;

//   // Load headers from backend
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const headers = await getDesignationExcelHeaders();
//         setExcelHeaders(Array.isArray(headers) ? headers : []);
//       } catch (err) {
//         console.error("Failed to load excel headers:", err);
//       }
//     };
//     void load();
//   }, []);

//   const openFilePicker = () => fileInputRef.current?.click();

//   const resetState = () => {
//     setResults([]);
//     setExcelRows([]);
//     setFileName("");
//     setSelectedFile(null);
//     setSelectedResultType(null);
//   };

//   const showErrorResult = (msg: string) => {
//     setResults([
//       {
//         rowNumber: 0,
//         correctData: false,
//         incorrectData: true,
//         duplicateData: false,
//         rowComment: msg,
//       },
//     ]);
//     setSelectDialogOpen(false);
//     setResultDialogOpen(true);
//   };

//   const readExcel = async (file: File) => {
//     const buffer = await file.arrayBuffer();
//     const wb = XLSX.read(buffer, { type: "array" });
//     if (!wb.SheetNames.length) throw new Error("Excel sheet not found.");
//     const sheet = wb.Sheets[wb.SheetNames[0]];
//     const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
//       header: 1,
//       defval: "",
//     });
//     if (rows.length < 2) {
//       setExcelRows([]);
//       return;
//     }
//     const fileHeaders = rows[1].map((v) => String(v).trim());
//     const dataRows: ExcelRow[] = rows
//       .slice(2)
//       .map((row, index) => {
//         const data = excelHeaders.reduce(
//           (acc, header) => {
//             const i = fileHeaders.indexOf(header);
//             acc[header] = i >= 0 ? String(row[i] ?? "").trim() : "";
//             return acc;
//           },
//           {} as Record<string, string>,
//         );
//         return { rowNumber: index + 3, data };
//       })
//       .filter((r) => Object.values(r.data).some((v) => v !== ""));
//     setExcelRows(dataRows);
//   };

//   const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     e.target.value = "";
//     if (!file) return;

//     resetState();
//     setFileName(file.name);
//     setSelectedFile(file);

//     if (!file.name.toLowerCase().endsWith(".xlsx")) {
//       showErrorResult(
//         "Incorrect file format. Please select a valid .xlsx Excel file.",
//       );
//       return;
//     }

//     if (excelHeaders.length === 0) {
//       showErrorResult("Headers still loading. Please try again in a moment.");
//       return;
//     }

//     try {
//       setUploading(true);
//       await readExcel(file);
//       const validation = await uploadDesignationExcel(file);
//       setResults(validation);
//       setSelectDialogOpen(false);
//       setResultDialogOpen(true);
//     } catch (error: any) {
//       console.error("EXCEL VALIDATION ERROR:", error);
//       showErrorResult(
//         error?.response?.data?.message ||
//           error?.message ||
//           "Unable to validate the Excel file.",
//       );
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleSave = async () => {
//     if (!selectedFile || saving || uploading || !isValidated || !hasCorrectRows)
//       return;
//     try {
//       setSaving(true);
//       await importDesignationExcel(selectedFile);
//       await onSuccess();
//       setResultDialogOpen(false);
//       resetState();
//     } catch (error: any) {
//       console.error("EXCEL SAVE ERROR:", error);
//       setResults((prev) => [
//         ...prev,
//         {
//           rowNumber: 0,
//           correctData: false,
//           incorrectData: true,
//           duplicateData: false,
//           rowComment:
//             error?.response?.data?.message ||
//             error?.message ||
//             "Unable to save the Excel data.",
//         },
//       ]);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleCloseSelect = () => !uploading && setSelectDialogOpen(false);

//   const handleCloseResult = () => {
//     if (!saving && !uploading) {
//       setResultDialogOpen(false);
//       resetState();
//     }
//   };

//   const getResult = (n: number) => results.find((r) => r.rowNumber === n);

//   const getDetailedComment = (comment?: string) => {
//     if (!comment)
//       return "Validation successful. This row contains valid data and is ready to be saved.";
//     const msg = comment.trim();
//     const low = msg.toLowerCase();
//     const add = (t: string) => `${msg} ${t}`;

//     if (low.includes("duplicate") || low.includes("already exists"))
//       return add(
//         "Please check the Designation Code and Designation Name. The same designation already exists in the system. Use unique values and validate the Excel file again.",
//       );
//     if (low.includes("short name"))
//       return add(
//         "Short Name should contain alphabets only. Remove numbers, special characters and unsupported symbols, then validate the file again.",
//       );
//     if (low.includes("designation code"))
//       return add(
//         "Check the Designation Code. It should be a valid alphanumeric code and must be unique. Correct the Excel row and validate again.",
//       );
//     if (low.includes("designation name"))
//       return add(
//         "Check the Designation Name. It should contain valid alphabets and spaces only and must be unique within the department.",
//       );
//     if (low.includes("designation level"))
//       return add(
//         "Designation Level must be between 1 and 20. Enter a valid level and validate the Excel file again.",
//       );
//     if (low.includes("department"))
//       return add(
//         "Check the Department value. Select a valid active department available in the system.",
//       );
//     if (low.includes("parent"))
//       return add(
//         "Check the Parent Designation. It cannot be the same designation and should belong to the same department.",
//       );
//     if (low.includes("job category"))
//       return add(
//         "Use one of the valid Job Categories: Clinical, Non-Clinical, Admin, IT or HR.",
//       );
//     if (low.includes("employment type"))
//       return add(
//         "Check Employment Type and enter a valid value from the available master options.",
//       );
//     if (low.includes("grade"))
//       return add(
//         "Check Grade and enter a valid value from the available master options.",
//       );
//     if (
//       low.includes("minimum experience") ||
//       low.includes("maximum experience")
//     )
//       return add(
//         "Minimum Experience and Maximum Experience must contain valid values, and Minimum Experience cannot be greater than Maximum Experience.",
//       );
//     if (low.includes("attachment") || low.includes("file size"))
//       return add(
//         "Check the attachment format and size according to the allowed Excel attachment rules.",
//       );
//     if (low.includes("status"))
//       return add(
//         "Check the Status value and enter a valid Active or Inactive value.",
//       );
//     return add(
//       "Correct the value mentioned in this row and validate the Excel file again.",
//     );
//   };

//   const getFilteredRows = () => {
//     if (!selectedResultType) return [];
//     return excelRows.filter((row) => {
//       const r = getResult(row.rowNumber);
//       if (!r) return false;
//       if (selectedResultType === "correct") return r.correctData;
//       if (selectedResultType === "incorrect") return r.incorrectData;
//       return r.duplicateData;
//     });
//   };

//   const selectedMeta = selectedResultType
//     ? RESULT_META[selectedResultType]
//     : null;

//   const resultHeader = (
//     meta: { title: string; color: string },
//     count: number,
//     type: ResultType,
//   ) => (
//     <Box
//       sx={{
//         width: "100%",
//         height: 68,
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         gap: "4px",
//         overflow: "hidden",
//       }}
//     >
//       <Typography
//         component="div"
//         sx={{
//           fontSize: 12,
//           fontWeight: 800,
//           color: meta.color,
//           lineHeight: 1,
//           whiteSpace: "nowrap",
//         }}
//       >
//         {meta.title}
//       </Typography>
//       <Button
//         size="small"
//         variant="outlined"
//         onClick={(e) => {
//           e.stopPropagation();
//           setSelectedResultType(type);
//         }}
//         disabled={count === 0}
//         sx={{
//           width: 68,
//           minWidth: 68,
//           height: 24,
//           minHeight: 24,
//           maxHeight: 24,
//           px: 1,
//           py: 0,
//           borderRadius: "6px",
//           fontSize: 10,
//           fontWeight: 700,
//           lineHeight: 1,
//           textTransform: "none",
//           color: meta.color,
//           borderColor: meta.color,
//           backgroundColor: "#FFFFFF",
//           "&:hover": { borderColor: meta.color, backgroundColor: "#F8F8F8" },
//           "&.Mui-disabled": { color: "#A9A9A9", borderColor: "#D6D6D6" },
//         }}
//       >
//         Select
//       </Button>
//     </Box>
//   );

//   const excelColumns: MRT_ColumnDef<ExcelRow>[] = [
//     {
//       accessorKey: "rowNumber",
//       header: "Row",
//       size: 60,
//       minSize: 60,
//       maxSize: 60,
//       muiTableHeadCellProps: {
//         sx: { ...cellSx(60, 70), padding: "0 6px !important" },
//       },
//       muiTableBodyCellProps: {
//         sx: {
//           ...cellSx(60, 48),
//           padding: "6px !important",
//           verticalAlign: "middle",
//         },
//       },
//       Cell: ({ row }) => (
//         <TableText
//           value={row.original.rowNumber}
//           align="center"
//           maxWidth={50}
//         />
//       ),
//     },

//     // 👇 Dynamic headers from backend
//     ...excelHeaders.map((header): MRT_ColumnDef<ExcelRow> => {
//       const w = colWidth(header);
//       const isDesc = header === "Description";
//       return {
//         id: header,
//         header,
//         accessorFn: (row) => row.data[header] || "",
//         size: w,
//         minSize: w,
//         maxSize: w,
//         muiTableHeadCellProps: {
//           sx: {
//             ...cellSx(w, 70),
//             padding: "8px !important",
//             whiteSpace: "nowrap !important",
//             overflow: "hidden !important",
//             textOverflow: "ellipsis",
//             verticalAlign: "middle",
//           },
//         },
//         muiTableBodyCellProps: {
//           sx: {
//             ...cellSx(w, 48),
//             padding: "8px !important",
//             verticalAlign: "middle",
//             whiteSpace: "nowrap !important",
//             overflow: "hidden !important",
//             textOverflow: "ellipsis",
//           },
//         },
//         Cell: ({ row }) => (
//           <TableText
//             value={row.original.data[header]}
//             align="left"
//             maxWidth={isDesc ? 225 : 170}
//           />
//         ),
//       };
//     }),

//     // 👇 Result columns
//     ...(["correct", "incorrect", "duplicate"] as const).map(
//       (type): MRT_ColumnDef<ExcelRow> => {
//         const meta = RESULT_META[type];
//         const count =
//           type === "correct"
//             ? correctCount
//             : type === "incorrect"
//               ? incorrectCount
//               : duplicateCount;
//         const w = type === "duplicate" ? 120 : 110;
//         const key =
//           type === "correct"
//             ? "correctData"
//             : type === "incorrect"
//               ? "incorrectData"
//               : "duplicateData";
//         return {
//           id: key,
//           header: meta.title,
//           accessorFn: (row) => {
//             const r = getResult(row.rowNumber);
//             return r && r[key as keyof ExcelUploadResult] ? meta.title : "";
//           },
//           size: w,
//           minSize: w,
//           maxSize: w,
//           Header: () => resultHeader(meta, count, type),
//           muiTableHeadCellProps: {
//             sx: {
//               ...cellSx(w, 70),
//               padding: "0 !important",
//               verticalAlign: "middle",
//               overflow: "hidden !important",
//             },
//           },
//           muiTableBodyCellProps: {
//             sx: {
//               ...cellSx(w, 48),
//               padding: "6px !important",
//               verticalAlign: "middle",
//               textAlign: "center",
//               overflow: "hidden !important",
//             },
//           },
//           Cell: ({ row }) => {
//             const r = getResult(row.original.rowNumber);
//             return r && r[key as keyof ExcelUploadResult] ? (
//               <Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   width: "100%",
//                   height: "100%",
//                 }}
//               >
//                 {RESULT_ICONS[type]}
//               </Box>
//             ) : (
//               "-"
//             );
//           },
//         };
//       },
//     ),

//     // Row comment column
//     {
//       id: "comment",
//       header: "Row Comment",
//       accessorFn: (row) =>
//         getResult(row.rowNumber)?.rowComment || "Validation successful",
//       size: 430,
//       minSize: 430,
//       maxSize: 430,
//       muiTableHeadCellProps: {
//         sx: {
//           ...cellSx(430, 70),
//           padding: "8px 12px !important",
//           verticalAlign: "middle",
//           whiteSpace: "nowrap !important",
//         },
//       },
//       muiTableBodyCellProps: {
//         sx: {
//           ...cellSx(430, 64),
//           padding: "7px 12px !important",
//           verticalAlign: "middle",
//           whiteSpace: "normal !important",
//           overflow: "hidden !important",
//           wordBreak: "break-word",
//           overflowWrap: "anywhere",
//           boxSizing: "border-box",
//         },
//       },
//       Cell: ({ row }) => {
//         const r = getResult(row.original.rowNumber);
//         const detailed = getDetailedComment(r?.rowComment);
//         const isCorrect = r?.correctData === true;
//         const isError = r?.incorrectData === true || r?.duplicateData === true;
//         return (
//           <Tooltip
//             title={
//               <Typography
//                 component="div"
//                 sx={{
//                   fontSize: 12,
//                   lineHeight: 1.5,
//                   whiteSpace: "normal",
//                   maxWidth: 450,
//                 }}
//               >
//                 {detailed}
//               </Typography>
//             }
//             arrow
//           >
//             <Box
//               sx={{
//                 width: "100%",
//                 maxWidth: 405,
//                 height: 50,
//                 display: "flex",
//                 alignItems: "center",
//                 overflow: "hidden",
//               }}
//             >
//               <Typography
//                 component="div"
//                 sx={{
//                   width: "100%",
//                   fontSize: 11.5,
//                   fontWeight: 600,
//                   lineHeight: 1.45,
//                   color: isCorrect
//                     ? "#027A48"
//                     : isError
//                       ? "#B42318"
//                       : "#7A8793",
//                   display: "-webkit-box",
//                   WebkitBoxOrient: "vertical",
//                   WebkitLineClamp: 2,
//                   overflow: "hidden",
//                   whiteSpace: "normal",
//                   wordBreak: "break-word",
//                   overflowWrap: "anywhere",
//                 }}
//               >
//                 {detailed}
//               </Typography>
//             </Box>
//           </Tooltip>
//         );
//       },
//     },
//   ];

//   return (
//     <>
//       <input
//         ref={fileInputRef}
//         type="file"
//         accept=".xlsx"
//         hidden
//         onChange={handleFileChange}
//       />

//       <Tooltip title="Upload Excel" placement="left" arrow>
//         <IconButton
//           onClick={() => setSelectDialogOpen(true)}
//           sx={{
//             width: 44,
//             height: 44,
//             borderRadius: "12px",
//             color: "#2E6B5F",
//             backgroundColor: "#EEF7F4",
//             border: "1px solid #CFE5DE",
//             "&:hover": {
//               backgroundColor: "#E1F1EC",
//               transform: "scale(1.05)",
//               boxShadow: "0 4px 16px rgba(46,107,95,0.2)",
//             },
//             transition: "all 0.25s ease",
//           }}
//         >
//           <CloudUploadRoundedIcon sx={{ fontSize: 24 }} />
//         </IconButton>
//       </Tooltip>

//       {/* Select file dialog */}
//       <Dialog
//         open={selectDialogOpen}
//         onClose={handleCloseSelect}
//         maxWidth="xs"
//         fullWidth
//         sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}
//       >
//         <DialogTitle
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             fontWeight: 800,
//             color: "#163A5F",
//             fontSize: 18,
//           }}
//         >
//           Select your Excel file
//           <IconButton onClick={handleCloseSelect} disabled={uploading}>
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent>
//           <Box
//             sx={{
//               mt: 1,
//               p: 4,
//               textAlign: "center",
//               border: "2px dashed #D8CFC6",
//               borderRadius: "14px",
//               backgroundColor: "#FAF8F6",
//               cursor: "pointer",
//               transition: "all 0.3s ease",
//               "&:hover": { borderColor: "#C47A42", backgroundColor: "#F5F0EA" },
//             }}
//             onClick={openFilePicker}
//           >
//             <CloudUploadRoundedIcon
//               sx={{ fontSize: 56, color: "#C47A42", mb: 1.5 }}
//             />
//             <Typography
//               sx={{ fontSize: 16, fontWeight: 700, color: "#2D2A27" }}
//             >
//               Click to select your Excel file
//             </Typography>
//             <Typography sx={{ mt: 0.5, fontSize: 13, color: "#9A8B7E" }}>
//               Supported format: .xlsx
//             </Typography>
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2 }}>
//           <Button onClick={handleCloseSelect} disabled={uploading}>
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={openFilePicker}
//             disabled={uploading}
//             startIcon={<CloudUploadRoundedIcon />}
//             sx={{
//               backgroundColor: "#2E6B5F",
//               "&:hover": { backgroundColor: "#25594F" },
//             }}
//           >
//             {uploading ? "Validating..." : "Select File"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Main result dialog */}
//       <Dialog
//         open={resultDialogOpen}
//         onClose={handleCloseResult}
//         maxWidth="xl"
//         fullWidth
//         sx={{
//           "& .MuiDialog-paper": { borderRadius: "16px", maxHeight: "92vh" },
//         }}
//       >
//         <DialogTitle
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             pb: 1.5,
//             borderBottom: "1px solid #F0EBE6",
//           }}
//         >
//           <Box>
//             <Typography
//               sx={{ fontSize: 20, fontWeight: 800, color: "#163A5F" }}
//             >
//               Excel Upload Result
//             </Typography>
//             {fileName && (
//               <Typography
//                 sx={{
//                   fontSize: 13,
//                   color: "#7A8793",
//                   fontWeight: 500,
//                   mt: 0.5,
//                 }}
//               >
//                 File: {fileName}
//               </Typography>
//             )}
//           </Box>
//           <IconButton
//             onClick={handleCloseResult}
//             disabled={saving || uploading}
//           >
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>

//         <DialogContent sx={{ pt: 2, pb: 1, overflow: "hidden" }}>
//           {excelRows.length > 0 && (
//             <Box sx={{ mb: 2 }}>
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 1.5,
//                   borderRadius: "12px",
//                   background:
//                     "linear-gradient(145deg, #FAF8F6 0%, #FFFFFF 100%)",
//                   border: "1px solid #E8E0D8",
//                 }}
//               >
//                 <Box
//                   sx={{
//                     display: "flex",
//                     flexWrap: "wrap",
//                     alignItems: "center",
//                     gap: 1.5,
//                   }}
//                 >
//                   <Chip label={`Total: ${totalRows}`} size="small" />
//                   {(
//                     [
//                       {
//                         type: "correct",
//                         count: correctCount,
//                         bgcolor: "#ECFDF3",
//                         color: "#027A48",
//                       },
//                       {
//                         type: "incorrect",
//                         count: incorrectCount,
//                         bgcolor: "#FEF3F2",
//                         color: "#B42318",
//                       },
//                       {
//                         type: "duplicate",
//                         count: duplicateCount,
//                         bgcolor: "#FFFAEB",
//                         color: "#B54708",
//                       },
//                     ] as const
//                   ).map(({ type, count, bgcolor, color }) => (
//                     <Chip
//                       key={type}
//                       label={`${RESULT_META[type].title}: ${count}`}
//                       size="small"
//                       onClick={() => count > 0 && setSelectedResultType(type)}
//                       disabled={count === 0}
//                       sx={{
//                         bgcolor,
//                         color,
//                         cursor: count > 0 ? "pointer" : "default",
//                       }}
//                     />
//                   ))}
//                   {!isValidated && (
//                     <Alert
//                       severity="info"
//                       sx={{ flex: 1, py: 0, borderRadius: "8px" }}
//                     >
//                       Validating Excel data...
//                     </Alert>
//                   )}
//                   {isValidated && hasErrors && hasCorrectRows && (
//                     <Alert
//                       severity="warning"
//                       sx={{ flex: 1, py: 0, borderRadius: "8px" }}
//                     >
//                       Some rows have issues. Only correct rows will be saved.
//                     </Alert>
//                   )}
//                   {isValidated && !hasErrors && hasCorrectRows && (
//                     <Alert
//                       severity="success"
//                       sx={{ flex: 1, py: 0, borderRadius: "8px" }}
//                     >
//                       All rows are valid. Ready to save.
//                     </Alert>
//                   )}
//                   {isValidated && !hasCorrectRows && (
//                     <Alert
//                       severity="error"
//                       sx={{ flex: 1, py: 0, borderRadius: "8px" }}
//                     >
//                       No valid rows are available to save.
//                     </Alert>
//                   )}
//                 </Box>
//               </Paper>
//             </Box>
//           )}

//           {excelRows.length > 0 && (
//             <Box
//               sx={{
//                 width: "100%",
//                 height: "calc(92vh - 245px)",
//                 minHeight: 380,
//                 border: "1px solid #E8E0D8",
//                 borderRadius: "12px",
//                 overflow: "hidden",
//                 "& .MuiTable-root": { tableLayout: "fixed" },
//                 "& .MuiTableCell-root": { boxSizing: "border-box" },
//               }}
//             >
//               <DesignationTable
//                 data={excelRows}
//                 columns={excelColumns}
//                 loading={uploading}
//               />
//             </Box>
//           )}

//           {excelRows.length === 0 && !uploading && results.length === 0 && (
//             <Alert severity="warning" sx={{ borderRadius: "10px" }}>
//               No data rows found in the selected Excel file.
//             </Alert>
//           )}
//         </DialogContent>

//         <DialogActions
//           sx={{ px: 3, py: 1.5, borderTop: "1px solid #F0EBE6", gap: 1.5 }}
//         >
//           <Button
//             variant="outlined"
//             onClick={handleCloseResult}
//             disabled={saving || uploading}
//             sx={{ textTransform: "none" }}
//           >
//             Close
//           </Button>
//           {excelRows.length > 0 && (
//             <Button
//               variant="contained"
//               onClick={handleSave}
//               disabled={!isValidated || !hasCorrectRows || saving || uploading}
//               sx={{
//                 textTransform: "none",
//                 fontWeight: 700,
//                 borderRadius: "8px",
//                 px: 4,
//                 background: "linear-gradient(145deg, #C47A42 0%, #A65320 100%)",
//                 "&:hover": {
//                   background:
//                     "linear-gradient(145deg, #B46A32 0%, #964A1A 100%)",
//                 },
//                 "&.Mui-disabled": { bgcolor: "#D8CFC6" },
//               }}
//             >
//               {saving ? "Saving..." : "Save"}
//             </Button>
//           )}
//         </DialogActions>
//       </Dialog>

//       {/* Selected result dialog */}
//       <Dialog
//         open={selectedResultType !== null}
//         onClose={() => setSelectedResultType(null)}
//         maxWidth="xl"
//         fullWidth
//         sx={{
//           "& .MuiDialog-paper": { borderRadius: "16px", maxHeight: "92vh" },
//         }}
//       >
//         <DialogTitle
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             gap: 1,
//             borderBottom: "1px solid #F0EBE6",
//             py: 1.5,
//           }}
//         >
//           <IconButton onClick={() => setSelectedResultType(null)} size="small">
//             <ArrowBackRoundedIcon />
//           </IconButton>
//           <Box>
//             <Typography
//               sx={{ fontSize: 19, fontWeight: 800, color: selectedMeta?.color }}
//             >
//               {selectedMeta?.title ? `${selectedMeta.title} Data` : ""}
//             </Typography>
//             <Typography sx={{ fontSize: 12, color: "#7A8793", mt: 0.3 }}>
//               {getFilteredRows().length} row
//               {getFilteredRows().length !== 1 ? "s" : ""} found
//             </Typography>
//           </Box>
//           <Box sx={{ flex: 1 }} />
//           <IconButton onClick={() => setSelectedResultType(null)}>
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>

//         <DialogContent sx={{ p: 2, overflow: "hidden" }}>
//           <TableContainer
//             sx={{
//               maxHeight: "70vh",
//               overflow: "auto",
//               border: "1px solid #E8E0D8",
//               borderRadius: "12px",
//               "&::-webkit-scrollbar": { width: 8, height: 8 },
//               "&::-webkit-scrollbar-thumb": {
//                 backgroundColor: "#B9C4CD",
//                 borderRadius: 8,
//               },
//             }}
//           >
//             <Table
//               stickyHeader
//               size="small"
//               sx={{ minWidth: 2400, tableLayout: "fixed" }}
//             >
//               <TableHead>
//                 <TableRow>
//                   <TableCell
//                     sx={{
//                       width: 60,
//                       minWidth: 60,
//                       maxWidth: 60,
//                       fontWeight: 800,
//                       bgcolor: "#F8F6F4",
//                     }}
//                   >
//                     Row
//                   </TableCell>
//                   {excelHeaders.map((header) => (
//                     <TableCell
//                       key={header}
//                       sx={{
//                         width: colWidth(header),
//                         minWidth:
//                           header === "Description" ? 240 : DEFAULT_COLUMN_WIDTH,
//                         fontWeight: 800,
//                         bgcolor: "#F8F6F4",
//                         fontSize: 11,
//                         whiteSpace: "nowrap",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                       }}
//                     >
//                       {header}
//                     </TableCell>
//                   ))}
//                   <TableCell
//                     sx={{
//                       width: 430,
//                       minWidth: 430,
//                       maxWidth: 430,
//                       fontWeight: 800,
//                       bgcolor: "#F8F6F4",
//                     }}
//                   >
//                     Detailed Comment
//                   </TableCell>
//                 </TableRow>
//               </TableHead>

//               <TableBody>
//                 {getFilteredRows().map((row) => {
//                   const r = getResult(row.rowNumber);
//                   const comment = getDetailedComment(r?.rowComment);
//                   const isCorrect = r?.correctData;
//                   return (
//                     <TableRow
//                       key={row.rowNumber}
//                       sx={{
//                         "&:hover": {
//                           backgroundColor: isCorrect ? "#F0FFF7" : "#FFF5F3",
//                         },
//                       }}
//                     >
//                       <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
//                         {row.rowNumber}
//                       </TableCell>
//                       {excelHeaders.map((header) => (
//                         <TableCell
//                           key={header}
//                           sx={{
//                             fontSize: 12,
//                             maxWidth: header === "Description" ? 240 : 180,
//                             whiteSpace: "nowrap",
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                           }}
//                         >
//                           <Tooltip title={row.data[header] || "-"} arrow>
//                             <span>{row.data[header] || "-"}</span>
//                           </Tooltip>
//                         </TableCell>
//                       ))}
//                       <TableCell
//                         sx={{
//                           width: 430,
//                           minWidth: 430,
//                           maxWidth: 430,
//                           whiteSpace: "normal",
//                           wordBreak: "break-word",
//                           overflowWrap: "anywhere",
//                           verticalAlign: "top",
//                           fontSize: 12,
//                           fontWeight: 600,
//                           lineHeight: 1.5,
//                           color: selectedMeta?.color,
//                         }}
//                       >
//                         {comment}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//                 {getFilteredRows().length === 0 && (
//                   <TableRow>
//                     <TableCell
//                       colSpan={excelHeaders.length + 2}
//                       align="center"
//                       sx={{ py: 5, color: "#7A8793", fontSize: 13 }}
//                     >
//                       No data available for this category.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </DialogContent>

//         <DialogActions sx={{ px: 3, py: 1.5, borderTop: "1px solid #F0EBE6" }}>
//           <Button
//             variant="outlined"
//             onClick={() => setSelectedResultType(null)}
//             startIcon={<ArrowBackRoundedIcon />}
//             sx={{ textTransform: "none" }}
//           >
//             Back
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default ExcelUpload;
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import * as XLSX from "xlsx";
import type { MRT_ColumnDef } from "material-react-table";
import DesignationTable, { TableText } from "./react-table";
import {
  uploadDesignationExcel,
  importDesignationExcel,
  getDesignationExcelHeaders,
} from "../../api/DesignationApi";

interface ExcelUploadResult {
  rowNumber: number;
  correctData: boolean;
  incorrectData: boolean;
  duplicateData: boolean;
  rowComment: string;
}

interface ExcelRow {
  rowNumber: number;
  data: Record<string, string>;
}

interface ExcelUploadProps {
  onSuccess: () => void | Promise<void>;
}

type ResultType = "correct" | "incorrect" | "duplicate";

const COLUMN_WIDTHS: Record<string, number> = {
  Description: 240,
  Skills: 180,
  Remarks: 180,
};
const DEFAULT_COLUMN_WIDTH = 140;
const colWidth = (header: string) =>
  COLUMN_WIDTHS[header] ?? DEFAULT_COLUMN_WIDTH;

const RESULT_META: Record<ResultType, { title: string; color: string }> = {
  correct: { title: "Correct", color: "#027A48" },
  incorrect: { title: "Invalid", color: "#B42318" },
  duplicate: { title: "Duplicate", color: "#B54708" },
};

const RESULT_ICONS: Record<ResultType, React.ReactNode> = {
  correct: <CheckCircleRoundedIcon sx={{ color: "#12B76A", fontSize: 21 }} />,
  incorrect: <ErrorRoundedIcon sx={{ color: "#D92D20", fontSize: 21 }} />,
  duplicate: <ContentCopyRoundedIcon sx={{ color: "#D97706", fontSize: 21 }} />,
};

const cellSx = (w: number, h: number) => ({
  width: `${w}px !important`,
  minWidth: `${w}px !important`,
  maxWidth: `${w}px !important`,
  height: `${h}px !important`,
  minHeight: `${h}px !important`,
  maxHeight: `${h}px !important`,
});

const ExcelUpload = ({ onSuccess }: ExcelUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectDialogOpen, setSelectDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [selectedResultType, setSelectedResultType] =
    useState<ResultType | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [excelRows, setExcelRows] = useState<ExcelRow[]>([]);
  const [results, setResults] = useState<ExcelUploadResult[]>([]);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);

  const correctCount = results.filter((r) => r.correctData).length;
  const incorrectCount = results.filter((r) => r.incorrectData).length;
  const duplicateCount = results.filter((r) => r.duplicateData).length;
  const totalRows = excelRows.length;
  const isValidated = results.length > 0;
  const hasErrors = incorrectCount > 0 || duplicateCount > 0;
  const hasCorrectRows = correctCount > 0;

  useEffect(() => {
    const load = async () => {
      try {
        const headers = await getDesignationExcelHeaders();
        setExcelHeaders(Array.isArray(headers) ? headers : []);
      } catch (err) {
        console.error("Failed to load excel headers:", err);
      }
    };
    void load();
  }, []);

  const openFilePicker = () => fileInputRef.current?.click();

  const resetState = () => {
    setResults([]);
    setExcelRows([]);
    setFileName("");
    setSelectedFile(null);
    setSelectedResultType(null);
  };

  const showErrorResult = (msg: string) => {
    setResults([
      {
        rowNumber: 0,
        correctData: false,
        incorrectData: true,
        duplicateData: false,
        rowComment: msg,
      },
    ]);
    setSelectDialogOpen(false);
    setResultDialogOpen(true);
  };

  const readExcel = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    if (!wb.SheetNames.length) throw new Error("Excel sheet not found.");
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
    });
    if (rows.length < 2) {
      setExcelRows([]);
      return;
    }
    const fileHeaders = rows[1].map((v) => String(v).trim());
    const dataRows: ExcelRow[] = rows
      .slice(2)
      .map((row, index) => {
        const data = excelHeaders.reduce(
          (acc, header) => {
            const i = fileHeaders.indexOf(header);
            acc[header] = i >= 0 ? String(row[i] ?? "").trim() : "";
            return acc;
          },
          {} as Record<string, string>,
        );
        return { rowNumber: index + 3, data };
      })
      .filter((r) => Object.values(r.data).some((v) => v !== ""));
    setExcelRows(dataRows);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    resetState();
    setFileName(file.name);
    setSelectedFile(file);

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      showErrorResult(
        "Incorrect file format. Please select a valid .xlsx Excel file.",
      );
      return;
    }

    if (excelHeaders.length === 0) {
      showErrorResult("Headers still loading. Please try again in a moment.");
      return;
    }

    try {
      setUploading(true);
      await readExcel(file);
      const validation = await uploadDesignationExcel(file);
      setResults(validation);
      setSelectDialogOpen(false);
      setResultDialogOpen(true);
    } catch (error: any) {
      console.error("EXCEL VALIDATION ERROR:", error);
      showErrorResult(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to validate the Excel file.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFile || saving || uploading || !isValidated || !hasCorrectRows)
      return;
    try {
      setSaving(true);
      await importDesignationExcel(selectedFile);
      await onSuccess();
      setResultDialogOpen(false);
      resetState();
    } catch (error: any) {
      console.error("EXCEL SAVE ERROR:", error);
      setResults((prev) => [
        ...prev,
        {
          rowNumber: 0,
          correctData: false,
          incorrectData: true,
          duplicateData: false,
          rowComment:
            error?.response?.data?.message ||
            error?.message ||
            "Unable to save the Excel data.",
        },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSelect = () => !uploading && setSelectDialogOpen(false);

  const handleCloseResult = () => {
    if (!saving && !uploading) {
      setResultDialogOpen(false);
      resetState();
    }
  };

  const getResult = (n: number) => results.find((r) => r.rowNumber === n);

  const getDetailedComment = (comment?: string) => {
    if (!comment)
      return "Validation successful. This row contains valid data and is ready to be saved.";
    const msg = comment.trim();
    const low = msg.toLowerCase();
    const add = (t: string) => `${msg} ${t}`;

    if (low.includes("duplicate") || low.includes("already exists"))
      return add(
        "Please check the Designation Code and Designation Name. The same designation already exists in the system. Use unique values and validate the Excel file again.",
      );
    if (low.includes("short name"))
      return add(
        "Short Name should contain alphabets only. Remove numbers, special characters and unsupported symbols, then validate the file again.",
      );
    if (low.includes("designation code"))
      return add(
        "Check the Designation Code. It should be a valid alphanumeric code and must be unique. Correct the Excel row and validate again.",
      );
    if (low.includes("designation name"))
      return add(
        "Check the Designation Name. It should contain valid alphabets and spaces only and must be unique within the department.",
      );
    if (low.includes("designation level"))
      return add(
        "Designation Level must be between 1 and 20. Enter a valid level and validate the Excel file again.",
      );
    if (low.includes("department"))
      return add(
        "Check the Department value. Select a valid active department available in the system.",
      );
    if (low.includes("parent"))
      return add(
        "Check the Parent Designation. It cannot be the same designation and should belong to the same department.",
      );
    if (low.includes("job category"))
      return add(
        "Use one of the valid Job Categories: Clinical, Non-Clinical, Admin, IT or HR.",
      );
    if (low.includes("employment type"))
      return add(
        "Check Employment Type and enter a valid value from the available master options.",
      );
    if (low.includes("grade"))
      return add(
        "Check Grade and enter a valid value from the available master options.",
      );
    if (
      low.includes("minimum experience") ||
      low.includes("maximum experience")
    )
      return add(
        "Minimum Experience and Maximum Experience must contain valid values, and Minimum Experience cannot be greater than Maximum Experience.",
      );
    if (low.includes("attachment") || low.includes("file size"))
      return add(
        "Check the attachment format and size according to the allowed Excel attachment rules.",
      );
    if (low.includes("status"))
      return add(
        "Check the Status value and enter a valid Active or Inactive value.",
      );
    return add(
      "Correct the value mentioned in this row and validate the Excel file again.",
    );
  };

  const getFilteredRows = () => {
    if (!selectedResultType) return [];
    return excelRows.filter((row) => {
      const r = getResult(row.rowNumber);
      if (!r) return false;
      if (selectedResultType === "correct") return r.correctData;
      if (selectedResultType === "incorrect") return r.incorrectData;
      return r.duplicateData;
    });
  };

  const getRowsByType = (type: ResultType) =>
    excelRows.filter((row) => {
      const r = getResult(row.rowNumber);
      if (!r) return false;
      if (type === "correct") return r.correctData;
      if (type === "incorrect") return r.incorrectData;
      return r.duplicateData;
    });

  const selectedMeta = selectedResultType
    ? RESULT_META[selectedResultType]
    : null;

  const resultHeader = (
    meta: { title: string; color: string },
    count: number,
    type: ResultType,
  ) => (
    <Box
      sx={{
        width: "100%",
        height: 68,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        overflow: "hidden",
      }}
    >
      <Typography
        component="div"
        sx={{
          fontSize: 12,
          fontWeight: 800,
          color: meta.color,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {meta.title}
      </Typography>
      <Button
        size="small"
        variant="outlined"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedResultType(type);
        }}
        disabled={count === 0}
        sx={{
          width: 68,
          minWidth: 68,
          height: 24,
          minHeight: 24,
          maxHeight: 24,
          px: 1,
          py: 0,
          borderRadius: "6px",
          fontSize: 10,
          fontWeight: 700,
          lineHeight: 1,
          textTransform: "none",
          color: meta.color,
          borderColor: meta.color,
          backgroundColor: "#FFFFFF",
          "&:hover": { borderColor: meta.color, backgroundColor: "#F8F8F8" },
          "&.Mui-disabled": { color: "#A9A9A9", borderColor: "#D6D6D6" },
        }}
      >
        Select
      </Button>
    </Box>
  );

  const excelColumns: MRT_ColumnDef<ExcelRow>[] = [
    {
      accessorKey: "rowNumber",
      header: "Row",
      size: 60,
      minSize: 60,
      maxSize: 60,
      muiTableHeadCellProps: {
        sx: { ...cellSx(60, 70), padding: "0 6px !important" },
      },
      muiTableBodyCellProps: {
        sx: {
          ...cellSx(60, 48),
          padding: "6px !important",
          verticalAlign: "middle",
        },
      },
      Cell: ({ row }) => (
        <TableText
          value={row.original.rowNumber}
          align="center"
          maxWidth={50}
        />
      ),
    },

    ...excelHeaders.map((header): MRT_ColumnDef<ExcelRow> => {
      const w = colWidth(header);
      const isDesc = header === "Description";
      return {
        id: header,
        header,
        accessorFn: (row) => row.data[header] || "",
        size: w,
        minSize: w,
        maxSize: w,
        muiTableHeadCellProps: {
          sx: {
            ...cellSx(w, 70),
            padding: "8px !important",
            whiteSpace: "nowrap !important",
            overflow: "hidden !important",
            textOverflow: "ellipsis",
            verticalAlign: "middle",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            ...cellSx(w, 48),
            padding: "8px !important",
            verticalAlign: "middle",
            whiteSpace: "nowrap !important",
            overflow: "hidden !important",
            textOverflow: "ellipsis",
          },
        },
        Cell: ({ row }) => (
          <TableText
            value={row.original.data[header]}
            align="left"
            maxWidth={isDesc ? 225 : 170}
          />
        ),
      };
    }),

    ...(["correct", "incorrect", "duplicate"] as const).map(
      (type): MRT_ColumnDef<ExcelRow> => {
        const meta = RESULT_META[type];
        const count =
          type === "correct"
            ? correctCount
            : type === "incorrect"
              ? incorrectCount
              : duplicateCount;
        const w = type === "duplicate" ? 120 : 110;
        const key =
          type === "correct"
            ? "correctData"
            : type === "incorrect"
              ? "incorrectData"
              : "duplicateData";
        return {
          id: key,
          header: meta.title,
          accessorFn: (row) => {
            const r = getResult(row.rowNumber);
            return r && r[key as keyof ExcelUploadResult] ? meta.title : "";
          },
          size: w,
          minSize: w,
          maxSize: w,
          Header: () => resultHeader(meta, count, type),
          muiTableHeadCellProps: {
            sx: {
              ...cellSx(w, 70),
              padding: "0 !important",
              verticalAlign: "middle",
              overflow: "hidden !important",
            },
          },
          muiTableBodyCellProps: {
            sx: {
              ...cellSx(w, 48),
              padding: "6px !important",
              verticalAlign: "middle",
              textAlign: "center",
              overflow: "hidden !important",
            },
          },
          Cell: ({ row }) => {
            const r = getResult(row.original.rowNumber);
            return r && r[key as keyof ExcelUploadResult] ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                {RESULT_ICONS[type]}
              </Box>
            ) : (
              "-"
            );
          },
        };
      },
    ),

    {
      id: "comment",
      header: "Row Comment",
      accessorFn: (row) =>
        getResult(row.rowNumber)?.rowComment || "Validation successful",
      size: 430,
      minSize: 430,
      maxSize: 430,
      muiTableHeadCellProps: {
        sx: {
          ...cellSx(430, 70),
          padding: "8px 12px !important",
          verticalAlign: "middle",
          whiteSpace: "nowrap !important",
        },
      },
      muiTableBodyCellProps: {
        sx: {
          ...cellSx(430, 64),
          padding: "7px 12px !important",
          verticalAlign: "middle",
          whiteSpace: "normal !important",
          overflow: "hidden !important",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          boxSizing: "border-box",
        },
      },
      Cell: ({ row }) => {
        const r = getResult(row.original.rowNumber);
        const detailed = getDetailedComment(r?.rowComment);
        const isCorrect = r?.correctData === true;
        const isError = r?.incorrectData === true || r?.duplicateData === true;
        return (
          <Tooltip
            title={
              <Typography
                component="div"
                sx={{
                  fontSize: 12,
                  lineHeight: 1.5,
                  whiteSpace: "normal",
                  maxWidth: 450,
                }}
              >
                {detailed}
              </Typography>
            }
            arrow
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 405,
                height: 50,
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <Typography
                component="div"
                sx={{
                  width: "100%",
                  fontSize: 11.5,
                  fontWeight: 600,
                  lineHeight: 1.45,
                  color: isCorrect
                    ? "#027A48"
                    : isError
                      ? "#B42318"
                      : "#7A8793",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                {detailed}
              </Typography>
            </Box>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        hidden
        onChange={handleFileChange}
      />

      <Tooltip title="Upload Excel" placement="left" arrow>
        <IconButton
          onClick={() => setSelectDialogOpen(true)}
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            color: "#2E6B5F",
            backgroundColor: "#EEF7F4",
            border: "1px solid #CFE5DE",
            "&:hover": {
              backgroundColor: "#E1F1EC",
              transform: "scale(1.05)",
              boxShadow: "0 4px 16px rgba(46,107,95,0.2)",
            },
            transition: "all 0.25s ease",
          }}
        >
          <CloudUploadRoundedIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Tooltip>

      {/* Select file dialog */}
      <Dialog
        open={selectDialogOpen}
        onClose={handleCloseSelect}
        maxWidth="xs"
        fullWidth
        sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 800,
            color: "#163A5F",
            fontSize: 18,
          }}
        >
          Select your Excel file
          <IconButton onClick={handleCloseSelect} disabled={uploading}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              mt: 1,
              p: 4,
              textAlign: "center",
              border: "2px dashed #D8CFC6",
              borderRadius: "14px",
              backgroundColor: "#FAF8F6",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": { borderColor: "#C47A42", backgroundColor: "#F5F0EA" },
            }}
            onClick={openFilePicker}
          >
            <CloudUploadRoundedIcon
              sx={{ fontSize: 56, color: "#C47A42", mb: 1.5 }}
            />
            <Typography
              sx={{ fontSize: 16, fontWeight: 700, color: "#2D2A27" }}
            >
              Click to select your Excel file
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, color: "#9A8B7E" }}>
              Supported format: .xlsx
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseSelect} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={openFilePicker}
            disabled={uploading}
            startIcon={<CloudUploadRoundedIcon />}
            sx={{
              backgroundColor: "#2E6B5F",
              "&:hover": { backgroundColor: "#25594F" },
            }}
          >
            {uploading ? "Validating..." : "Select File"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main result dialog */}
      <Dialog
        open={resultDialogOpen}
        onClose={handleCloseResult}
        maxWidth="xl"
        fullWidth
        sx={{
          "& .MuiDialog-paper": { borderRadius: "16px", maxHeight: "92vh" },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1.5,
            borderBottom: "1px solid #F0EBE6",
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: 20, fontWeight: 800, color: "#163A5F" }}
            >
              Excel Upload Result
            </Typography>
            {fileName && (
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#7A8793",
                  fontWeight: 500,
                  mt: 0.5,
                }}
              >
                File: {fileName}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={handleCloseResult}
            disabled={saving || uploading}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, pb: 1, overflow: "auto" }}>
          {excelRows.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: "12px",
                  background:
                    "linear-gradient(145deg, #FAF8F6 0%, #FFFFFF 100%)",
                  border: "1px solid #E8E0D8",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Chip label={`Total: ${totalRows}`} size="small" />
                  {(
                    [
                      {
                        type: "correct",
                        count: correctCount,
                        bgcolor: "#ECFDF3",
                        color: "#027A48",
                      },
                      {
                        type: "incorrect",
                        count: incorrectCount,
                        bgcolor: "#FEF3F2",
                        color: "#B42318",
                      },
                      {
                        type: "duplicate",
                        count: duplicateCount,
                        bgcolor: "#FFFAEB",
                        color: "#B54708",
                      },
                    ] as const
                  ).map(({ type, count, bgcolor, color }) => (
                    <Chip
                      key={type}
                      label={`${RESULT_META[type].title}: ${count}`}
                      size="small"
                      onClick={() => count > 0 && setSelectedResultType(type)}
                      disabled={count === 0}
                      sx={{
                        bgcolor,
                        color,
                        cursor: count > 0 ? "pointer" : "default",
                      }}
                    />
                  ))}
                  {!isValidated && (
                    <Alert
                      severity="info"
                      sx={{ flex: 1, py: 0, borderRadius: "8px" }}
                    >
                      Validating Excel data...
                    </Alert>
                  )}
                  {isValidated && hasErrors && hasCorrectRows && (
                    <Alert
                      severity="warning"
                      sx={{ flex: 1, py: 0, borderRadius: "8px" }}
                    >
                      Some rows have issues. Only correct rows will be saved.
                    </Alert>
                  )}
                  {isValidated && !hasErrors && hasCorrectRows && (
                    <Alert
                      severity="success"
                      sx={{ flex: 1, py: 0, borderRadius: "8px" }}
                    >
                      All rows are valid. Ready to save.
                    </Alert>
                  )}
                  {isValidated && !hasCorrectRows && (
                    <Alert
                      severity="error"
                      sx={{ flex: 1, py: 0, borderRadius: "8px" }}
                    >
                      No valid rows are available to save.
                    </Alert>
                  )}
                </Box>
              </Paper>
            </Box>
          )}

          {excelRows.length > 0 && (
            <Box
              sx={{
                width: "100%",
                height: "calc(92vh - 245px)",
                minHeight: 380,
                border: "1px solid #E8E0D8",
                borderRadius: "12px",
                overflow: "hidden",
                "& .MuiTable-root": { tableLayout: "fixed" },
                "& .MuiTableCell-root": { boxSizing: "border-box" },
              }}
            >
              <DesignationTable
                data={excelRows}
                columns={excelColumns}
                loading={uploading}
              />
            </Box>
          )}

          {/* 👇 EXTRA: separate tables for Correct / Invalid / Duplicate */}
          {excelRows.length > 0 &&
            (["correct", "incorrect", "duplicate"] as const).map((type) => {
              const meta = RESULT_META[type];
              const count =
                type === "correct"
                  ? correctCount
                  : type === "incorrect"
                    ? incorrectCount
                    : duplicateCount;
              const rows = getRowsByType(type);

              return (
                <Box
                  key={type}
                  sx={{
                    mt: 3,
                    border: "1px solid #E8E0D8",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.2,
                      backgroundColor: "#F8F6F4",
                      borderBottom: "1px solid #E8E0D8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 15, fontWeight: 800, color: meta.color }}
                    >
                      {meta.title} Data
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12, color: "#7A8793", fontWeight: 600 }}
                    >
                      {count} record{count !== 1 ? "s" : ""}
                    </Typography>
                  </Box>

                  <TableContainer
                    sx={{
                      maxHeight: "40vh",
                      overflow: "auto",
                      "&::-webkit-scrollbar": { width: 8, height: 8 },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#B9C4CD",
                        borderRadius: 8,
                      },
                    }}
                  >
                    <Table
                      stickyHeader
                      size="small"
                      sx={{ minWidth: 2400, tableLayout: "fixed" }}
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              width: 60,
                              minWidth: 60,
                              maxWidth: 60,
                              fontWeight: 800,
                              bgcolor: "#F8F6F4",
                            }}
                          >
                            Row
                          </TableCell>
                          {excelHeaders.map((header) => (
                            <TableCell
                              key={header}
                              sx={{
                                width: colWidth(header),
                                minWidth:
                                  header === "Description"
                                    ? 240
                                    : DEFAULT_COLUMN_WIDTH,
                                fontWeight: 800,
                                bgcolor: "#F8F6F4",
                                fontSize: 11,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {header}
                            </TableCell>
                          ))}
                          <TableCell
                            sx={{
                              width: 430,
                              minWidth: 430,
                              maxWidth: 430,
                              fontWeight: 800,
                              bgcolor: "#F8F6F4",
                            }}
                          >
                            Detailed Comment
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {rows.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={excelHeaders.length + 2}
                              align="center"
                              sx={{
                                py: 4,
                                color: "#7A8793",
                                fontSize: 13,
                                fontStyle: "italic",
                              }}
                            >
                              0 records
                            </TableCell>
                          </TableRow>
                        ) : (
                          rows.map((row) => {
                            const r = getResult(row.rowNumber);
                            const comment = getDetailedComment(r?.rowComment);
                            return (
                              <TableRow
                                key={row.rowNumber}
                                sx={{
                                  "&:hover": { backgroundColor: "#F5F5F5" },
                                }}
                              >
                                <TableCell
                                  sx={{ fontWeight: 700, fontSize: 12 }}
                                >
                                  {row.rowNumber}
                                </TableCell>
                                {excelHeaders.map((header) => (
                                  <TableCell
                                    key={header}
                                    sx={{
                                      fontSize: 12,
                                      maxWidth:
                                        header === "Description" ? 240 : 180,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    <Tooltip
                                      title={row.data[header] || "-"}
                                      arrow
                                    >
                                      <span>{row.data[header] || "-"}</span>
                                    </Tooltip>
                                  </TableCell>
                                ))}
                                <TableCell
                                  sx={{
                                    width: 430,
                                    minWidth: 430,
                                    maxWidth: 430,
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                    overflowWrap: "anywhere",
                                    verticalAlign: "top",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    lineHeight: 1.5,
                                    color: meta.color,
                                  }}
                                >
                                  {comment}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              );
            })}

          {excelRows.length === 0 && !uploading && results.length === 0 && (
            <Alert severity="warning" sx={{ borderRadius: "10px" }}>
              No data rows found in the selected Excel file.
            </Alert>
          )}
        </DialogContent>

        <DialogActions
          sx={{ px: 3, py: 1.5, borderTop: "1px solid #F0EBE6", gap: 1.5 }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseResult}
            disabled={saving || uploading}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
          {excelRows.length > 0 && (
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!isValidated || !hasCorrectRows || saving || uploading}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "8px",
                px: 4,
                background: "linear-gradient(145deg, #C47A42 0%, #A65320 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(145deg, #B46A32 0%, #964A1A 100%)",
                },
                "&.Mui-disabled": { bgcolor: "#D8CFC6" },
              }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Selected result dialog — untouched */}
      <Dialog
        open={selectedResultType !== null}
        onClose={() => setSelectedResultType(null)}
        maxWidth="xl"
        fullWidth
        sx={{
          "& .MuiDialog-paper": { borderRadius: "16px", maxHeight: "92vh" },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: "1px solid #F0EBE6",
            py: 1.5,
          }}
        >
          <IconButton onClick={() => setSelectedResultType(null)} size="small">
            <ArrowBackRoundedIcon />
          </IconButton>
          <Box>
            <Typography
              sx={{ fontSize: 19, fontWeight: 800, color: selectedMeta?.color }}
            >
              {selectedMeta?.title ? `${selectedMeta.title} Data` : ""}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#7A8793", mt: 0.3 }}>
              {getFilteredRows().length} row
              {getFilteredRows().length !== 1 ? "s" : ""} found
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <IconButton onClick={() => setSelectedResultType(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2, overflow: "hidden" }}>
          <TableContainer
            sx={{
              maxHeight: "70vh",
              overflow: "auto",
              border: "1px solid #E8E0D8",
              borderRadius: "12px",
              "&::-webkit-scrollbar": { width: 8, height: 8 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#B9C4CD",
                borderRadius: 8,
              },
            }}
          >
            <Table
              stickyHeader
              size="small"
              sx={{ minWidth: 2400, tableLayout: "fixed" }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: 60,
                      minWidth: 60,
                      maxWidth: 60,
                      fontWeight: 800,
                      bgcolor: "#F8F6F4",
                    }}
                  >
                    Row
                  </TableCell>
                  {excelHeaders.map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        width: colWidth(header),
                        minWidth:
                          header === "Description" ? 240 : DEFAULT_COLUMN_WIDTH,
                        fontWeight: 800,
                        bgcolor: "#F8F6F4",
                        fontSize: 11,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      width: 430,
                      minWidth: 430,
                      maxWidth: 430,
                      fontWeight: 800,
                      bgcolor: "#F8F6F4",
                    }}
                  >
                    Detailed Comment
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {getFilteredRows().map((row) => {
                  const r = getResult(row.rowNumber);
                  const comment = getDetailedComment(r?.rowComment);
                  const isCorrect = r?.correctData;
                  return (
                    <TableRow
                      key={row.rowNumber}
                      sx={{
                        "&:hover": {
                          backgroundColor: isCorrect ? "#F0FFF7" : "#FFF5F3",
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                        {row.rowNumber}
                      </TableCell>
                      {excelHeaders.map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            fontSize: 12,
                            maxWidth: header === "Description" ? 240 : 180,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <Tooltip title={row.data[header] || "-"} arrow>
                            <span>{row.data[header] || "-"}</span>
                          </Tooltip>
                        </TableCell>
                      ))}
                      <TableCell
                        sx={{
                          width: 430,
                          minWidth: 430,
                          maxWidth: 430,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          verticalAlign: "top",
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: 1.5,
                          color: selectedMeta?.color,
                        }}
                      >
                        {comment}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {getFilteredRows().length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={excelHeaders.length + 2}
                      align="center"
                      sx={{ py: 5, color: "#7A8793", fontSize: 13 }}
                    >
                      No data available for this category.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5, borderTop: "1px solid #F0EBE6" }}>
          <Button
            variant="outlined"
            onClick={() => setSelectedResultType(null)}
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ textTransform: "none" }}
          >
            Back
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExcelUpload;