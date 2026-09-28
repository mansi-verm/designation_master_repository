package com.organization.designation_master.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DesignationAnalyticsResponseDto {

    private long total;
    private long active;
    private long inactive;
    private double activePercentage;

    private List<ChartData> gradeWise;
    private List<ChartData> statusWise;
    private List<ChartData> dateWise;
    private List<ChartData> departmentWise;
    private List<ChartData> levelWise;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class ChartData {

        private String label;
        private long count;
    }
}