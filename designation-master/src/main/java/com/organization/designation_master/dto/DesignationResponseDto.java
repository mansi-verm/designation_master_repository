package com.organization.designation_master.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@JsonPropertyOrder({
        "id",
        "designationCode",
        "designationName",
        "shortName",
        "departmentId",
        "departmentName",
        "designationLevel",
        "parentDesignationId",
        "jobCategory",
        "employmentType",
        "grade",
        "minExperience",
        "maxExperience",
        "description",
        "skills",
        "branchIds",
        "status",
        "attachments",
        "remarks",
        "createdBy",
        "updatedBy",
        "createdAt",
        "updatedAt"
})
public class DesignationResponseDto implements Serializable {
    private Long id;
    private String designationCode;
    private String designationName;
    private String shortName;
    private Long departmentId;
    private String departmentName;
    private Integer designationLevel;
    private Long parentDesignationId;
    private String jobCategory;
    private String employmentType;
    private String grade;
    private Integer minExperience;
    private Integer maxExperience;
    private String description;
    private List<String> skills;
    private List<String> branchIds;
    private boolean status;
    //    private String attachments;
    private List<Map<String, Object>> attachments;
    private String remarks;
    private String createdBy;
    private String updatedBy;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;
}