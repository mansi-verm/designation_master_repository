package com.organization.designation_master.dto;

import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;

import java.util.Arrays;
import java.util.List;

public class DesignationExcelDto {

    private static final DataFormatter FORMATTER = new DataFormatter();

    public static DesignationRequestDto toRequest(Row row) {
        DesignationRequestDto dto = new DesignationRequestDto();
        dto.setDesignationCode(value(row, 0));
        dto.setDesignationName(value(row, 1));
        dto.setShortName(value(row, 2));
        dto.setDepartmentId(longValue(row, 3));
        dto.setDesignationLevel(intValue(row, 4));
        dto.setParentDesignationId(longValue(row, 5));
        dto.setJobCategory(value(row, 6));
        dto.setEmploymentType(value(row, 7));
        dto.setGrade(value(row, 8));
        dto.setMinExperience(intValue(row, 9));
        dto.setMaxExperience(intValue(row, 10));
        dto.setDescription(value(row, 11));
        dto.setSkills(listValue(row, 12));
        dto.setBranchIds(listValue(row, 13));
        dto.setStatus(booleanValue(row, 14));
        dto.setAttachments(value(row, 15));
        dto.setRemarks(value(row, 16));
        return dto;
    }

    private static String value(Row row, int index) {
        if (row.getCell(index) == null) return "";
        return FORMATTER.formatCellValue(row.getCell(index)).trim();
    }

    private static Long longValue(Row row, int index) {
        String value = value(row, index);
        return value.isBlank() ? null : Long.valueOf(value);
    }

    private static Integer intValue(Row row, int index) {
        String value = value(row, index);
        return value.isBlank() ? null : Integer.valueOf(value);
    }

    private static List<String> listValue(Row row, int index) {
        String value = value(row, index);

        return value.isBlank() ? null : Arrays.stream(value.split(",")).map(String::trim).toList();
    }

    private static Boolean booleanValue(Row row, int index) {
        String value = value(row, index);
        if (value.isBlank()) return null;
        if (!value.equalsIgnoreCase("true") && !value.equalsIgnoreCase("false"))
            throw new IllegalArgumentException("Status must be true or false");
        return Boolean.valueOf(value);
    }
}