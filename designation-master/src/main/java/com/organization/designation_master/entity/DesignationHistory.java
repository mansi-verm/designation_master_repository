//package com.organization.designation_master.entity;
//
//import jakarta.persistence.*;
//import lombok.Getter;
//import lombok.Setter;
//
//import java.time.LocalDateTime;
//
//@Getter
//@Setter
//@Entity
//@Table(name = "designation_history")
//public class DesignationHistory {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//    @Column(nullable = false)
//    private Long designationId;
//    @Column(nullable = false, length = 30)
//    private String action;
//    @Column
//    private Long changedBy;
//    @Column(nullable = false)
//    private LocalDateTime changedAt;
//    @Column(columnDefinition = "TEXT")
//    private String details;
//}
package com.organization.designation_master.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "designation_history")
public class DesignationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @Column(nullable = false)
    private Long designationId;

    @Column(length = 20, nullable = false)
    private String designationCode;

    @Column(length = 150, nullable = false)
    private String designationName;

    @Column(length = 50)
    private String shortName;

    @Column(nullable = false)
    private Long departmentId;

    private Integer designationLevel;

    private Long parentDesignationId;

    @Column(length = 50)
    private String jobCategory;

    @Column(length = 100)
    private String employmentType;

    @Column(length = 20)
    private String grade;

    private Integer minExperience;

    private Integer maxExperience;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> skills;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> branchIds;

    @Column(nullable = false)
    private boolean status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<Map<String, Object>> attachments;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private Long createdBy;

    private LocalDateTime createdAt;

    private Long updatedBy;

    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private boolean isDeleted;

    @Column(length = 20, nullable = false)
    private String action;

    private Long changedBy;

    @Column(nullable = false)
    private LocalDateTime changedAt;
}