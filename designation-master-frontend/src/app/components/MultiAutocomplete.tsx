// import {
//   Autocomplete as MuiAutocomplete,
//   TextField,
//   Checkbox,
//   ListItemText,
//   Typography,
// } from "@mui/material";
// import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
// import CheckBoxIcon from "@mui/icons-material/CheckBox";

// interface Option {
//   label: string;
//   value: string;
// }

// interface MultiAutocompleteProps {
//   label: string;
//   options: Option[];
//   value: Option[];
//   onChange: (value: Option[]) => void;
//   disabled?: boolean;
//   required?: boolean;
//   error?: boolean;
//   helperText?: string;
//   /** Set false to hide Select All row. Default: true */
//   showSelectAll?: boolean;
// }

// const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
// const checkedIcon = <CheckBoxIcon fontSize="small" />;

// // Pseudo-option for Select All row only — filtered before onChange.
// const SELECT_ALL_OPTION: Option = {
//   value: "__SELECT_ALL__",
//   label: "Select All",
// };

// const MultiAutocomplete = ({
//   label,
//   options,
//   value,
//   onChange,
//   disabled = false,
//   required = false,
//   error = false,
//   helperText,
//   showSelectAll = true,
// }: MultiAutocompleteProps) => {
//   const displayOptions: Option[] = showSelectAll
//     ? [SELECT_ALL_OPTION, ...options]
//     : options;

//   const allSelected =
//     options.length > 0 &&
//     options.every((opt) =>
//       value.some((v) => String(v.value) === String(opt.value)),
//     );

//   const someSelected = value.length > 0 && !allSelected;

//   const handleSelectAllToggle = () => {
//     if (allSelected) {
//       onChange([]);
//     } else {
//       onChange([...options]);
//     }
//   };

//   return (
//     <MuiAutocomplete
//       multiple
//       disableCloseOnSelect
//       size="small"
//       options={displayOptions}
//       value={value}
//       disabled={disabled}
//       getOptionLabel={(option) => option.label ?? ""}
//       isOptionEqualToValue={(option, selectedOption) =>
//         String(option.value) === String(selectedOption.value)
//       }
//       filterOptions={(opts, state) => {
//         const input = state.inputValue.toLowerCase();
//         return opts.filter((opt) => {
//           if (opt.value === SELECT_ALL_OPTION.value) return true;
//           return (opt.label ?? "").toLowerCase().includes(input);
//         });
//       }}
//       onChange={(_event, newValue, reason) => {
//         const clickedSelectAll =
//           reason === "selectOption" &&
//           newValue.some((v) => v.value === SELECT_ALL_OPTION.value);

//         if (clickedSelectAll) {
//           handleSelectAllToggle();
//           return;
//         }

//         onChange(newValue.filter((v) => v.value !== SELECT_ALL_OPTION.value));
//       }}
//       renderOption={(props, option, { selected }) => {
//         const { key, ...rest } = props as any;

//         // Select All row
//         if (option.value === SELECT_ALL_OPTION.value) {
//           return (
//             <li
//               {...rest}
//               key="__SELECT_ALL__"
//               style={{
//                 position: "sticky",
//                 top: 0,
//                 zIndex: 1,
//                 backgroundColor: "#fff",
//                 borderBottom: "1px solid #e5e7eb",
//               }}
//             >
//               <Checkbox
//                 icon={icon}
//                 checkedIcon={checkedIcon}
//                 indeterminate={someSelected}
//                 style={{ marginRight: 8 }}
//                 checked={allSelected}
//                 size="small"
//               />
//               <ListItemText
//                 primary={
//                   <Typography sx={{ fontWeight: 700, fontSize: "13px" }}>
//                     {allSelected ? "Deselect All" : "Select All"}
//                   </Typography>
//                 }
//               />
//             </li>
//           );
//         }

//         // Normal option
//         return (
//           <li {...rest} key={String(option.value)}>
//             <Checkbox
//               icon={icon}
//               checkedIcon={checkedIcon}
//               style={{ marginRight: 8 }}
//               checked={selected}
//               size="small"
//             />
//             <ListItemText
//               primary={option.label}
//               slotProps={{
//                 primary: { sx: { fontSize: "13px" } },
//               }}
//             />
//           </li>
//         );
//       }}
//       renderInput={(params) => (
//         <TextField
//           {...params}
//           label={label}
//           required={required}
//           error={error}
//           helperText={helperText}
//         />
//       )}
//     />
//   );
// };

// export default MultiAutocomplete;
import {
  Autocomplete as MuiAutocomplete,
  TextField,
  Checkbox,
  ListItemText,
  Typography,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

interface Option {
  label: string;
  value: string;
}

interface MultiAutocompleteProps {
  label: string;
  options: Option[];
  value: Option[];
  onChange: (value: Option[]) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  /** Set false to hide Select All row. Default: true */
  showSelectAll?: boolean;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

// Pseudo-option for Select All row only — filtered before onChange.
const SELECT_ALL_OPTION: Option = {
  value: "__SELECT_ALL__",
  label: "Select All",
};

const MultiAutocomplete = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  error = false,
  helperText,
  showSelectAll = true,
}: MultiAutocompleteProps) => {
  const displayOptions: Option[] = showSelectAll
    ? [SELECT_ALL_OPTION, ...options]
    : options;

  const allSelected =
    options.length > 0 &&
    options.every((opt) =>
      value.some((v) => String(v.value) === String(opt.value)),
    );

  const someSelected = value.length > 0 && !allSelected;

  const handleSelectAllToggle = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  return (
    <MuiAutocomplete
      multiple
      disableCloseOnSelect
      size="small"
      slotProps={{ popper: { sx: { minWidth: 240 } } }}
      options={displayOptions}
      value={value}
      disabled={disabled}
      getOptionLabel={(option) => option.label ?? ""}
      isOptionEqualToValue={(option, selectedOption) =>
        String(option.value) === String(selectedOption.value)
      }
      filterOptions={(opts, state) => {
        const input = state.inputValue.toLowerCase();
        return opts.filter((opt) => {
          if (opt.value === SELECT_ALL_OPTION.value) return true;
          return (opt.label ?? "").toLowerCase().includes(input);
        });
      }}
      onChange={(_event, newValue, reason) => {
        const clickedSelectAll =
          reason === "selectOption" &&
          newValue.some((v) => v.value === SELECT_ALL_OPTION.value);

        if (clickedSelectAll) {
          handleSelectAllToggle();
          return;
        }

        onChange(newValue.filter((v) => v.value !== SELECT_ALL_OPTION.value));
      }}
      renderOption={(props, option, { selected }) => {
        const { key, ...rest } = props as any;

        // Select All row
        if (option.value === SELECT_ALL_OPTION.value) {
          return (
            <li
              {...rest}
              key="__SELECT_ALL__"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "#fff",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                indeterminate={someSelected}
                style={{ marginRight: 8 }}
                checked={allSelected}
                size="small"
              />
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 700, fontSize: "13px" }}>
                    {allSelected ? "Deselect All" : "Select All"}
                  </Typography>
                }
              />
            </li>
          );
        }

        // Normal option
        return (
          <li {...rest} key={String(option.value)}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
              size="small"
            />
            <ListItemText
              primary={option.label}
              slotProps={{
                primary: { sx: { fontSize: "13px" } },
              }}
            />
          </li>
        );
      }}
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

export default MultiAutocomplete;
