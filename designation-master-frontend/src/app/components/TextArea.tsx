import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material/TextField";

const TextArea = ({
  required = false,
  fullWidth = true,
  minRows = 4,
  size = "small",
  ...props
}: TextFieldProps) => {
  return (
    <TextField
      {...props}
      required={required}
      fullWidth={fullWidth}
      multiline
      minRows={minRows}
      size={size}
    />
  );
};

export default TextArea;
