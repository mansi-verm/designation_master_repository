import {
  Checkbox,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const MultiSelect = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  error = false,
  helperText,
}: MultiSelectProps) => {
  return (
    <FormControl
      fullWidth
      size="small"
      disabled={disabled}
      required={required}
      error={error}
    >
      <InputLabel required={required}>{label}</InputLabel>

      <Select
        multiple
        value={value}
        onChange={(event) => onChange(event.target.value as string[])}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) =>
          (selected as string[])
            .map(
              (selectedValue) =>
                options.find((option) => option.value === selectedValue)?.label,
            )
            .filter(Boolean)
            .join(", ")
        }
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox size="small" checked={value.includes(option.value)} />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default MultiSelect;
