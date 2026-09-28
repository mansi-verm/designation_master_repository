import * as yup from "yup";

export const designationValidation = yup.object({
  designationCode: yup
    .string()
    .trim()
    .required("Designation Code is mandatory")
    .matches(/^[A-Za-z0-9]+$/, "Designation Code must be alphanumeric")
    .max(20, "Maximum 20 characters allowed"),

  designationName: yup
    .string()
    .trim()
    .required("Designation Name is mandatory")
    .matches(/^[A-Za-z ]+$/, "Designation Name must contain alphabets only")
    .max(150, "Maximum 150 characters allowed"),

  shortName: yup
    .string()
    .trim()
    .test(
      "short-name-alphabets",
      "Short Name must contain alphabets only",
      (value) => {
        if (!value) return true;
        return /^[A-Za-z]+( [A-Za-z]+)*$/.test(value);
      },
    )
    .max(50, "Maximum 50 characters allowed")
    .optional(),

  departmentId: yup.string().required("Department selection is mandatory"),

  designationLevel: yup
    .string()
    .required("Designation Level is mandatory")
    .test(
      "valid-level",
      "Designation Level must be between 1 and 20",
      (value) => {
        if (!value) return false;
        const level = Number(value);
        return Number.isInteger(level) && level >= 1 && level <= 20;
      },
    ),

  parentDesignation: yup
    .object({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .nullable()
    .optional(),

  jobCategory: yup.string().trim().required("Job Category is mandatory"),

  employmentType: yup.array().of(yup.string().required()),

  grade: yup.string().trim().optional(),

  minExperience: yup
    .string()
    .test(
      "valid-min-experience",
      "Minimum Experience must be a whole number between 0 and 50",
      (value) => {
        if (!value) return true;
        const number = Number(value);
        return Number.isInteger(number) && number >= 0 && number <= 50;
      },
    ),

  maxExperience: yup
    .string()
    .test(
      "valid-max-experience",
      "Maximum Experience must be a whole number between 0 and 50",
      function (value) {
        if (!value) return true;
        const number = Number(value);
        if (!Number.isInteger(number) || number < 0 || number > 50) {
          return false;
        }
        const min = Number(this.parent.minExperience);
        if (!this.parent.minExperience) {
          return true;
        }
        return number >= min;
      },
    ),

  description: yup
    .string()
    .max(1000, "Maximum 1000 characters allowed")
    .optional(),

  skills: yup.array().of(
    yup.object({
      label: yup.string(),
      value: yup.string(),
    }),
  ),

  branchIds: yup.array().of(yup.string()),

  status: yup.string().oneOf(["true", "false"], "Invalid status").optional(),

  
  attachments: yup.array().of(yup.mixed<File>()).optional(),

  remarks: yup.string().max(1000, "Maximum 1000 characters allowed").optional(),
});
