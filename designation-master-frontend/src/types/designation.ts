export interface Option {
  label: string;
  value: string;
}

export interface Designation {
  id: number;
  designationCode: string;
  designationName: string;
  shortName: string | null;
  departmentId: number;
  designationLevel: number;
  parentDesignationId: number | null;
  jobCategory: string;
  employmentType: string | null;
  grade: string | null;
  minExperience: number | null;
  maxExperience: number | null;
  description: string | null;
  skills: string[];
  branchIds: string[];
  status: boolean;
  attachments:
    | {
        id: string;
        fileName: string;
        storedName: string;
        url: string;
      }[]
    | null;
  remarks: string | null;
  createdBy?: number;
  createdAt?: string;
  updatedBy?: number;
  updatedAt?: string;
}

export interface DesignationFormData {
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
  skills: Option[];
  branchIds: string[];
  status: string;
  attachments: File[];
  remarks: string;
}

export interface DesignationDropdowns {
  departments: Option[];
  designationLevels: Option[];
  jobCategories: Option[];
  employmentTypes: Option[];
  grades: Option[];
  branches: Option[];
}
