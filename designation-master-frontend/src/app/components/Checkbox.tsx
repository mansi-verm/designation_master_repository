import { Checkbox as MuiCheckbox, FormControlLabel } from "@mui/material";

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
}

const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
}: CheckboxProps) => {
  return (
    <FormControlLabel
      label={label}
      disabled={disabled}
      control={
        <MuiCheckbox
          size="small"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
      }
    />
  );
};

export default Checkbox;
