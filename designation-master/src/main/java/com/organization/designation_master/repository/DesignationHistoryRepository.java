package com.organization.designation_master.repository;

import com.organization.designation_master.dto.DesignationHistoryDto;
import com.organization.designation_master.entity.DesignationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DesignationHistoryRepository extends JpaRepository<DesignationHistory, Long> {

    List<DesignationHistory> findByDesignationIdOrderByChangedAtDesc(Long designationId);

    @Query("SELECT new com.organization.designation_master.dto.DesignationHistoryDto(h.historyId, h.designationId, h.designationCode, h.designationName, h.shortName, h.departmentId, h.designationLevel, h.parentDesignationId, h.jobCategory, h.employmentType, h.grade, h.minExperience, h.maxExperience, h.description, h.skills, h.branchIds, h.status, h.attachments, h.remarks, h.createdBy, null, h.createdAt, h.updatedBy, null, h.updatedAt, h.isDeleted, h.action, h.changedBy, null, h.changedAt) FROM DesignationHistory h ORDER BY h.changedAt DESC")
    List<DesignationHistoryDto> findHistory();
}