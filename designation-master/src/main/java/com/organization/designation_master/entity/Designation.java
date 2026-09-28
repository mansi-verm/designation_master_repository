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
@Table(name = "designation_master")
public class Designation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(length = 20, nullable = false)
    private String designationCode;
    @Column(length = 150, nullable = false)
    private String designationName;
    @Column(length = 50)
    private String shortName;
    @Column(nullable = false)
    private Long departmentId;
    @Column()
    private Integer designationLevel;
    @Column()
    private Long parentDesignationId;
    @Column(length = 50)
    private String jobCategory;
    @Column(length = 100)
    private String employmentType;
    @Column(length = 20)
    private String grade;
    @Column()
    private Integer minExperience;
    @Column()
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
    @Column()
    private Long createdBy;
    @Column()
    private LocalDateTime createdAt;
    @Column()
    private Long updatedBy;
    @Column()
    private LocalDateTime updatedAt;
    @Column(nullable = false)
    private boolean isDeleted;


}