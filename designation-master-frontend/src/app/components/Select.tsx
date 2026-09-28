import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
} from "@mui/material";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const Select = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  error = false,
  helperText,
}: SelectProps) => {
  return (
    <FormControl
      fullWidth
      size="small"
      disabled={disabled}
      required={required}
      error={error}
    >
      <InputLabel required={required}>{label}</InputLabel>

      <MuiSelect
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default Select;
