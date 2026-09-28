import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio as MuiRadio,
  RadioGroup,
  FormHelperText,
} from "@mui/material";

interface Option {
  label: string;
  value: string;
}

interface RadioProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const Radio = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  error = false,
  helperText,
}: RadioProps) => {
  return (
    <FormControl disabled={disabled} required={required} error={error}>
      <FormLabel required={required}>{label}</FormLabel>

      <RadioGroup
        row
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            label={option.label}
            control={<MuiRadio size="small" />}
          />
        ))}
      </RadioGroup>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default Radio;
