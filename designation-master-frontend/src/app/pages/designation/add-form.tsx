import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { designationValidation } from "../../pages/validation/designationValidation";
import type { DesignationFormData, Option } from "../../../types/designation";
import TextField from "../../components/TextField";
import TextArea from "../../components/TextArea";
import Autocomplete from "../../components/Autocomplete";
import MultiAutocomplete from "../../components/MultiAutocomplete";
import Attachment from "../../components/Attachment";

interface AddFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: DesignationFormData[]) => Promise<void> | void;
  departmentOptions: Option[];
  designationLevelOptions: Option[];
  parentDesignationOptions: Option[];
  jobCategoryOptions: Option[];
  employmentTypeOptions: Option[];
  gradeOptions: Option[];
  skillOptions: Option[];
  branchOptions: Option[];
}

interface SkillItem {
  value: string;
  label: string;
}

interface DesignationArrayItem {
  id?: number;
  designationCode: string;
  designationName: string;
  shortName: string;
  departmentId: string;
  designationLevel: string;
  parentDesignation: Option | null;
  jobCategory: string;
  employmentType: string[];
  grade: string;
  minExperience: string;
  maxExperience: string;
  description: string;
  skills: SkillItem[];
  branchIds: string[];
  status: string;
  attachments: File[];
  remarks: string;
}

interface DesignationArrayFormValues {
  designations: DesignationArrayItem[];
}

const createEmptyDesignation = (): DesignationArrayItem => ({
  designationCode: "",
  designationName: "",
  shortName: "",
  departmentId: "",
  designationLevel: "",
  parentDesignation: null,
  jobCategory: "",
  employmentType: [],
  grade: "",
  minExperience: "",
  maxExperience: "",
  description: "",
  skills: [],
  branchIds: [],
  status: "true",
  attachments: [],
  remarks: "",
});

const arrayValidation = yup.object({
  designations: yup.array().of(designationValidation).min(1).required(),
});

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "9px",
    backgroundColor: "#fff",
    fontSize: "14px",
  },
  "& .MuiInputLabel-root": {
    fontSize: "14px",
  },
  "& .MuiFormHelperText-root": {
    fontSize: "11px",
  },
};

const AddForm = ({
  open,
  onClose,
  onSave,
  departmentOptions,
  designationLevelOptions,
  parentDesignationOptions,
  jobCategoryOptions,
  employmentTypeOptions,
  gradeOptions,
  skillOptions,
  branchOptions,
}: AddFormProps) => {
  const [skillsToAddBuffer, setSkillsToAddBuffer] = useState<Option[]>([]);

  const {
    control,
    reset,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<DesignationArrayFormValues>({
    defaultValues: {
      designations: [createEmptyDesignation()],
    },
    resolver: yupResolver(arrayValidation) as any,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "designations",
  });

  useEffect(() => {
    if (!open) return;
    setSkillsToAddBuffer([]);
    reset({ designations: [createEmptyDesignation()] });
  }, [open, reset]);

  const addDesignation = () => {
    append(createEmptyDesignation());
  };

  const removeDesignation = (index: number) => {
    if (fields.length <= 1) return;
    remove(index);
  };

  const removeSkill = (
    skillIndex: number,
    currentSkills: SkillItem[],
    onChange: (value: SkillItem[]) => void,
  ) => {
    const updatedSkills = currentSkills.filter((_, i) => i !== skillIndex);
    onChange(updatedSkills);
  };

  const handleReset = () => {
    setSkillsToAddBuffer([]);
    reset({ designations: [createEmptyDesignation()] });
  };

  const submitForm = async (data: DesignationArrayFormValues) => {
    const finalData: DesignationFormData[] = data.designations.map((item) => ({
      id: item.id,
      designationCode: item.designationCode.trim(),
      designationName: item.designationName.trim(),
      shortName: item.shortName.trim(),
      departmentId: item.departmentId,
      designationLevel: item.designationLevel,
      parentDesignation: item.parentDesignation,
      jobCategory: item.jobCategory,
      employmentType: item.employmentType,
      grade: item.grade,
      minExperience: item.minExperience,
      maxExperience: item.maxExperience,
      description: item.description,
      skills: item.skills,
      branchIds: item.branchIds,
      status: item.status,
      attachments: item.attachments,
      remarks: item.remarks,
    }));
    await onSave(finalData);
  };

  const handleFormSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValid = await trigger();
    if (!isValid) return;
    const currentData = getValues();
    await submitForm(currentData);
  };

  const getAvailableSkills = (currentSkills: SkillItem[]) => {
    const addedSkillValues = currentSkills.map((s) => String(s.value));
    return skillOptions.filter(
      (option) => !addedSkillValues.includes(String(option.value)),
    );
  };

  const handleDialogClose = (_event: any, reason: string) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backgroundColor: "#fff",
          fontSize: "20px",
          fontWeight: 700,
          color: "#163A5F",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        Add Designation
      </DialogTitle>

      <Box component="form" onSubmit={handleFormSubmit} noValidate>
        <DialogContent
          dividers
          sx={{
            backgroundColor: "#f8fafc",
            py: 2.5,
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {fields.map((arrayField, index) => {
            const rowErrors = errors.designations?.[index];
            const currentSkills =
              getValues(`designations.${index}.skills`) || [];
            const availableSkills = getAvailableSkills(currentSkills);

            return (
              <Box
                key={arrayField.id}
                sx={{
                  mb: 3,
                  p: 2,
                  border: "1px solid #dbe3ec",
                  borderRadius: "12px",
                  backgroundColor: "#fff",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#163A5F",
                    }}
                  >
                    Designation {index + 1}
                  </Typography>

                  {fields.length > 1 && (
                    <IconButton
                      type="button"
                      onClick={() => removeDesignation(index)}
                      sx={{ color: "#d32f2f" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <Controller
                    name={`designations.${index}.designationCode`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        required
                        label="Designation Code"
                        error={Boolean(rowErrors?.designationCode)}
                        helperText={rowErrors?.designationCode?.message}
                        sx={fieldSx}
                      />
                    )}
                  />

                  <Controller
                    name={`designations.${index}.designationName`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        required
                        label="Designation Name"
                        error={Boolean(rowErrors?.designationName)}
                        helperText={rowErrors?.designationName?.message}
                        sx={fieldSx}
                      />
                    )}
                  />

                  <Controller
                    name={`designations.${index}.shortName`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Short Name"
                        error={Boolean(rowErrors?.shortName)}
                        helperText={rowErrors?.shortName?.message}
                        sx={fieldSx}
                      />
                    )}
                  />

                  <Controller
                    name={`designations.${index}.departmentId`}
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        label="Department"
                        options={departmentOptions}
                        value={
                          departmentOptions.find(
                            (option) =>
                              String(option.value) === String(field.value),
                          ) ?? null
                        }
                        required
                        error={Boolean(rowErrors?.departmentId)}
                        helperText={rowErrors?.departmentId?.message}
                        onChange={(value) => {
                          field.onChange(value ? String(value.value) : "");
                        }}
                      />
                    )}
                  />

                  <Controller
                    name={`designations.${index}.designationLevel`}
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        label="Designation Level"
                        options={designationLevelOptions}
                        value={
                          designationLevelOptions.find(
                            (option) =>
                              String(option.value) === String(field.value),
                          ) ?? null
                        }
                        required
                        error={Boolean(rowErrors?.designationLevel)}
                        helperText={rowErrors?.designationLevel?.message}
                        onChange={(value) => {
                          field.onChange(value ? String(value.value) : "");
                        }}
                      />
                    )}
                  />

                  <Controller
                    name={`designations.${index}.parentDesignation`}
                    control={control}
                    render={({ field }) => {
                      const selectedParent = field.value
                        ? (parentDesignationOptions.find(
                            (option) =>
                              String(option.value) ===
                              String(field.value?.value),
                          ) ?? field.value)
                        : null;
                      return (
                        <Autocomplete
                          label="Parent Designation"
                          options={parentDesignationOptions}
                          value={selectedParent}
                          error={Boolean(rowErrors?.parentDesignation)}
                          helperText={rowErrors?.parentDesignation?.message}
                          onChange={(value) => field.onChange(value ?? null)}
                        />
                      );
                    }}
                  />

                  <Controller
                    name={`designations.${index}.jobCategory`}
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        label="Job Category"
                        options={jobCategoryOptions}
                        value={
                          jobCategoryOptions.find(
                            (option) =>
                              String(option.value) === String(field.value),
                          ) ?? null
                        }
                        required
                        error={Boolean(rowErrors?.jobCategory)}
                        helperText={rowErrors?.jobCategory?.message}
                        onChange={(value) => {
                          field.onChange(value ? String(value.value) : "");
                        }}
                      />
                    )}
                  />

                  <Controller
                    name={`designations.${index}.employmentType`}
                    control={control}
                    render={({ field }) => {
                      const selectedEmploymentType =
                        employmentTypeOptions.find(
                          (option) =>
                            String(option.value) ===
                            String(field.value?.[0] ?? ""),
                        ) ?? null;
                      return (
                        <Autocomplete
                          label="Employment Type"
                          options={employmentTypeOptions}
                          value={selectedEmploymentType}
                          error={Boolean(rowErrors?.employmentType)}
                          helperText={rowErrors?.employmentType?.message}
                          onChange={(value) => {
                            field.onChange(value ? [String(value.value)] : []);
                          }}
                        />
                      );
                    }}
                  />

                  <Controller
                    name={`designations.${index}.grade`}
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        label="Grade"
                        options={gradeOptions}
                        value={
                          gradeOptions.find(
                            (option) =>
                              String(option.value) === String(field.value),
                          ) ?? null
                        }
                        error={Boolean(rowErrors?.grade)}
                        helperText={rowErrors?.grade?.message}
                        onChange={(value) => {
                          field.onChange(value ? String(value.value) : "");
                        }}
                      />
                    )}
                  />

                  <Controller
                    name={`designations.${index}.minExperience`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Minimum Experience"
                        error={Boolean(rowErrors?.minExperience)}
                        helperText={rowErrors?.minExperience?.message}
                        sx={fieldSx}
                      />
                    )}
                  />

                  <Controller
                    name={`designations.${index}.maxExperience`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Maximum Experience"
                        error={Boolean(rowErrors?.maxExperience)}
                        helperText={rowErrors?.maxExperience?.message}
                        sx={fieldSx}
                      />
                    )}
                  />

                  <Box
                    sx={{
                      gridColumn: { xs: "auto", sm: "1 / -1" },
                      border: "1px solid #dbe3ec",
                      borderRadius: "10px",
                      p: 1.5,
                      backgroundColor: "#fff",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        mb: 1,
                        color: "#163A5F",
                      }}
                    >
                      Skills
                    </Typography>

                    <Controller
                      name={`designations.${index}.skills`}
                      control={control}
                      render={({ field }) => (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "flex-start",
                              mb: 1.5,
                            }}
                          >
                            <MultiAutocomplete
                              label="Select Skill"
                              options={availableSkills}
                              value={skillsToAddBuffer}
                              onChange={(values) =>
                                setSkillsToAddBuffer(values)
                              }
                            />

                            <Button
                              type="button"
                              variant="outlined"
                              startIcon={<AddIcon />}
                              onClick={() => {
                                const existing = field.value ?? [];
                                const merged = [
                                  ...existing,
                                  ...skillsToAddBuffer.filter(
                                    (s) =>
                                      !existing.some(
                                        (e) =>
                                          String(e.value) === String(s.value),
                                      ),
                                  ),
                                ];
                                field.onChange(merged);
                                setSkillsToAddBuffer([]);
                              }}
                              sx={{
                                minWidth: "120px",
                                height: "40px",
                                borderRadius: "8px",
                                textTransform: "none",
                              }}
                            >
                              Add Skill
                            </Button>
                          </Box>

                          {(field.value ?? []).map((skill, skillIndex) => (
                            <Box
                              key={`${skill.value}-${skillIndex}`}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                border: "1px solid #e1e7ee",
                                borderRadius: "8px",
                                px: 1.5,
                                py: 0.8,
                                mb: 0.8,
                                backgroundColor: "#fafcff",
                              }}
                            >
                              <Typography sx={{ fontSize: "13px" }}>
                                {skill.label}
                              </Typography>

                              <IconButton
                                size="small"
                                type="button"
                                onClick={() =>
                                  removeSkill(
                                    skillIndex,
                                    field.value ?? [],
                                    field.onChange,
                                  )
                                }
                                sx={{ color: "#d32f2f" }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}

                          {rowErrors?.skills && (
                            <Typography
                              sx={{
                                color: "#d32f2f",
                                fontSize: "11px",
                                mt: 0.5,
                              }}
                            >
                              {rowErrors.skills.message}
                            </Typography>
                          )}
                        </>
                      )}
                    />
                  </Box>

                  <Controller
                    name={`designations.${index}.branchIds`}
                    control={control}
                    render={({ field }) => (
                      <MultiAutocomplete
                        label="Branches"
                        options={branchOptions}
                        value={branchOptions.filter((option) =>
                          (field.value ?? []).some(
                            (v) => String(v) === String(option.value),
                          ),
                        )}
                        onChange={(values) => {
                          field.onChange(
                            values.map((option) => String(option.value)),
                          );
                        }}
                      />
                    )}
                  />

                  <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
                    <Controller
                      name={`designations.${index}.description`}
                      control={control}
                      render={({ field }) => (
                        <TextArea
                          {...field}
                          label="Description"
                          error={Boolean(rowErrors?.description)}
                          helperText={rowErrors?.description?.message}
                          sx={fieldSx}
                        />
                      )}
                    />
                  </Box>

                  <Controller
                    name={`designations.${index}.attachments`}
                    control={control}
                    render={({ field }) => (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 0.5,
                        }}
                      >
                        <Attachment
                          key={`attachment-${arrayField.id}-${field.value?.map((file) => file.name).join("-") || "empty"}`}
                          label="Upload Attachment"
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          value={field.value ?? []}
                          error={Boolean(rowErrors?.attachments)}
                          helperText={rowErrors?.attachments?.message}
                          maxSizeMB={20}
                          onChange={field.onChange}
                        />
                        {field.value?.length > 0 && (
                          <IconButton
                            size="small"
                            type="button"
                            aria-label="Remove attachment"
                            onClick={() => field.onChange([])}
                            sx={{ mt: 1, color: "#d32f2f" }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    )}
                  />

                  <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
                    <Controller
                      name={`designations.${index}.remarks`}
                      control={control}
                      render={({ field }) => (
                        <TextArea
                          {...field}
                          label="Remarks"
                          error={Boolean(rowErrors?.remarks)}
                          helperText={rowErrors?.remarks?.message}
                          sx={fieldSx}
                        />
                      )}
                    />
                  </Box>

                  {index === fields.length - 1 && (
                    <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
                      <Button
                        type="button"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addDesignation}
                        sx={{ borderRadius: "8px", textTransform: "none" }}
                      >
                        Add Designation
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", gap: 1.5, py: 2 }}>
          <Button
            type="submit"
            variant="outlined"
            disabled={isSubmitting}
            sx={{
              borderColor: "#2e7d32",
              color: "#2e7d32",
              "&:hover": {
                borderColor: "#1b5e20",
                backgroundColor: "rgba(46, 125, 50, 0.04)",
              },
            }}
          >
            Save
          </Button>

          <Button
            type="button"
            variant="outlined"
            onClick={handleReset}
            disabled={isSubmitting}
            sx={{
              borderColor: "#ed6c02",
              color: "#ed6c02",
              "&:hover": {
                borderColor: "#e65100",
                backgroundColor: "rgba(237, 108, 2, 0.04)",
              },
            }}
          >
            Reset
          </Button>

          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              borderColor: "#d32f2f",
              color: "#d32f2f",
              border: "1px solid #d32f2f",
              "&:hover": {
                borderColor: "#b71c1c",
                backgroundColor: "rgba(211, 47, 47, 0.04)",
              },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AddForm;
