package com.organization.designation_master.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AnalyticsRowDto {

    private final String grade;
    private final Boolean status;
    private final Long departmentId;
    private final Integer designationLevel;
    private final LocalDateTime createdAt;
}