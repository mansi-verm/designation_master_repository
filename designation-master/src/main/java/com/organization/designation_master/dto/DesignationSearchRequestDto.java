package com.organization.designation_master.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class DesignationSearchRequestDto {


    private Long departmentId;
    private Integer designationLevel;
    private String grade;
    private Boolean status;
    private LocalDate fromDate;
    private LocalDate toDate;
    private int page = 0;
    private int size = 10;
}