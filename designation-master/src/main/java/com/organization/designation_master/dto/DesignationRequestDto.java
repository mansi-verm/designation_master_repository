package com.organization.designation_master.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DesignationRequestDto {

    private Long id;

    @NotBlank(message = "Designation Code is mandatory")
    @Pattern(regexp = "^[A-Za-z0-9]+$", message = "Designation Code must be alphanumeric")
    @Size(max = 20, message = "Designation Code must be less than or equal to 20 characters")
    private String designationCode;
    @NotBlank(message = "Designation Name is mandatory")
    @Pattern(regexp = "^[A-Za-z]+( [A-Za-z]+)*$", message = "Designation Name must contain alphabets only")
    @Size(max = 150, message = "Designation Name must be less than or equal to 150 characters")
    private String designationName;
    @Size(max = 50, message = "Short Name must be less than or equal to 50 characters")
    @Pattern(regexp = "^[A-Za-z]+( [A-Za-z]+)*$", message = "Short Name must contain alphabets only")
    private String shortName;
    @NotNull(message = "Department selection is mandatory")
    private Long departmentId;
    @NotNull(message = "Designation Level is mandatory")
    @Min(value = 1, message = "Designation Level must be at least 1")
    @Max(value = 20, message = "Designation Level cannot exceed 20")
    private Integer designationLevel;
    private Long parentDesignationId;
    @NotBlank(message = "Job Category is mandatory")
    private String jobCategory;
    private String employmentType;
    private String grade;
    @Min(value = 0, message = "Minimum experience cannot be negative")
    @Max(value = 50, message = "Minimum experience cannot exceed 50 years")
    private Integer minExperience;
    @Min(value = 0, message = "Maximum experience cannot be negative")
    @Max(value = 50, message = "Maximum experience cannot exceed 50 years")
    private Integer maxExperience;
    @Size(max = 1000, message = "Description must be less than or equal to 1000 characters")
    private String description;
    private List<String> skills;
    private List<String> branchIds;
    @NotNull(message = "status is mandatory")
    private Boolean status;
    private String attachments;
    @Size(max = 1000, message = "Remarks must be less than or equal to 1000 characters")
    private String remarks;
    private Long createdBy;
    private Long updatedBy;

    public void setDesignationCode(String designationCode) {
        this.designationCode = trim(designationCode);
    }

    public void setDesignationName(String designationName) {
        this.designationName = trim(designationName);
    }

    public void setShortName(String shortName) {
        this.shortName = trim(shortName);
    }

    public void setJobCategory(String jobCategory) {
        this.jobCategory = trim(jobCategory);
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = trim(employmentType);
    }

    public void setGrade(String grade) {
        this.grade = trim(grade);
    }

    public void setDescription(String description) {
        this.description = trim(description);
    }

    public void setAttachments(String attachments) {
        this.attachments = trim(attachments);
    }

    public void setRemarks(String remarks) {
        this.remarks = trim(remarks);
    }

//    private String trim(String value) {
//        return value == null ? null : value.trim();
//    }
private String trim(String value) {
    if (value == null) return null;
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
}
}