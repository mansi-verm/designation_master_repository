
package com.organization.designation_master.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.stream.IntStream;

@Getter
@Setter
public class DropdownDto {
    private List<DepartmentDto> departments = List.of();
    private List<Integer> levels = IntStream.rangeClosed(1, 20).boxed().toList();
    private List<String> grades = List.of("A1", "A2", "B1", "B2");
    private List<Boolean> statuses = List.of(true, false);
    private List<String> jobCategories = List.of("Clinical", "Non-Clinical", "Admin", "IT", "HR");
    private List<String> employmentTypes = List.of("Full Time", "Part Time", "Contract", "Intern");
    private List<SkillDto> skills = List.of();
    private List<BranchDto> branches = List.of();
}