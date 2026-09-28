import { TextField as MuiTextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material/TextField";

const TextField = ({
  required = false,
  fullWidth = true,
  size = "small",
  ...props
}: TextFieldProps) => {
  return (
    <MuiTextField
      {...props}
      required={required}
      fullWidth={fullWidth}
      size={size}
    />
  );
};

export default TextField;
