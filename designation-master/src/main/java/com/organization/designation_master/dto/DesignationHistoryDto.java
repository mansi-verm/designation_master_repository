//
//package com.organization.designation_master.dto;
//
//import lombok.AllArgsConstructor;
//import lombok.Getter;
//import lombok.Setter;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Map;
//
//@Getter
//@Setter
//@AllArgsConstructor
//public class DesignationHistoryDto {
//
//    private Long historyId;
//
//    private Long designationId;
//
//    private String designationCode;
//
//    private String designationName;
//
//    private String shortName;
//
//    private Long departmentId;
//
//    private Integer designationLevel;
//
//    private Long parentDesignationId;
//
//    private String jobCategory;
//
//    private String employmentType;
//
//    private String grade;
//
//    private Integer minExperience;
//
//    private Integer maxExperience;
//
//    private String description;
//
//    private List<String> skills;
//
//    private List<String> branchIds;
//
//    private boolean status;
//
//    private List<Map<String, Object>> attachments;
//
//    private String remarks;
//
//    private Long createdBy;
//
//    private String createdByName;
//
//    private LocalDateTime createdAt;
//
//    private Long updatedBy;
//
//    private String updatedByName;
//
//    private LocalDateTime updatedAt;
//
//    private boolean isDeleted;
//
//    private String action;
//
//    private Long changedBy;
//
//    private String changedByName;
//
//    private LocalDateTime changedAt;
//}
package com.organization.designation_master.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DesignationHistoryDto {

    private Long historyId;
    private Long designationId;
    private String designationCode;
    private String designationName;
    private String shortName;
    private Long departmentId;
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
    private List<Map<String, Object>> attachments;
    private String remarks;
    private Long createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
    private Long updatedBy;
    private String updatedByName;
    private LocalDateTime updatedAt;
    private boolean isDeleted;
    private String action;
    private Long changedBy;
    private String changedByName;
    private LocalDateTime changedAt;
}