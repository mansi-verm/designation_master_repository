import { Button, FormHelperText, Stack, Typography } from "@mui/material";
import type { ChangeEvent } from "react";

interface AttachmentProps {
  label?: string;
  accept?: string;
  value?: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  maxSizeMB?: number;
}

const Attachment = ({
  label = "Upload File",
  accept = ".pdf,.doc,.docx,.xls,.xlsx",
  value = [],
  onChange,
  disabled = false,
  required = false,
  error = false,
  helperText,
  maxSizeMB = 20,
}: AttachmentProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const maxSize = maxSizeMB * 1024 * 1024;

    const validFiles = files.filter((file) => file.size <= maxSize);

    onChange(validFiles);
  };

  return (
    <Stack spacing={0.5}>
      <Button
        component="label"
        variant="outlined"
        disabled={disabled}
        fullWidth
        sx={{
          minHeight: 40,
          justifyContent: "flex-start",
          textTransform: "none",
        }}
      >
        {value.length
          ? `${value.length} file${value.length > 1 ? "s" : ""} selected`
          : `${label}${required ? " *" : ""}`}

        <input
          hidden
          type="file"
          multiple
          accept={accept}
          onChange={handleChange}
        />
      </Button>

      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}

      <Typography variant="caption" color="text.secondary">
        PDF, DOC, DOCX, XLS, XLSX · Maximum {maxSizeMB} MB per file
      </Typography>

      {value.map((file) => (
        <Typography key={`${file.name}-${file.size}`} variant="caption">
          {file.name}
        </Typography>
      ))}
    </Stack>
  );
};

export default Attachment;
