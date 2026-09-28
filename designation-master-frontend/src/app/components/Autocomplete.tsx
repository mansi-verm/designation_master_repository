import { Autocomplete as MuiAutocomplete, TextField } from "@mui/material";

interface Option {
  label: string;
  value: string;
}

interface AutocompleteProps {
  label: string;
  options: Option[];
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const Autocomplete = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  error = false,
  helperText,
}: AutocompleteProps) => {
  return (
    <MuiAutocomplete
      options={options}
      value={value}
      disabled={disabled}
      size="small"
      onChange={(_, newValue) => onChange(newValue)}
      isOptionEqualToValue={(option, selectedOption) =>
        option.value === selectedOption.value
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
};

export default Autocomplete;
