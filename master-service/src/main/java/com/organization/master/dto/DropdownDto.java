//package com.organization.master.dto;
//
//import lombok.Getter;
//
//import java.util.List;
//import java.util.stream.IntStream;
//
//@Getter
//public class DropdownDto {
//
//    private final List<Long> departments = List.of(1L, 2L, 3L);
//    private final List<Integer> levels = IntStream.rangeClosed(1, 20).boxed().toList();
//    private final List<String> grades = List.of("A1", "A2", "B1", "B2");
//    private final List<Boolean> statuses = List.of(true, false);
//    private final List<String> jobCategories = List.of("Clinical", "Non-Clinical", "Admin", "IT", "HR");
//    private final List<String> employmentTypes = List.of("Full Time", "Part Time", "Contract", "Intern");
//    private final List<String> skills = List.of("Java", "React", "SQL");
//    private final List<String> branches = List.of("Branch 1", "Branch 2", "Branch 3");
//}
package com.organization.master.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.stream.IntStream;

@Getter
@Setter
public class DropdownDto {

    private List<DepartmentDto> departments;
    private List<Integer> levels = IntStream.rangeClosed(1, 20).boxed().toList();
    private List<String> grades = List.of("A1", "A2", "B1", "B2");
    private List<Boolean> statuses = List.of(true, false);
    private List<String> jobCategories = List.of("Clinical", "Non-Clinical", "Admin", "IT", "HR");
    private List<String> employmentTypes = List.of("Full Time", "Part Time", "Contract", "Intern");
    private List<SkillDto> skills;
    private List<BranchDto> branches;
}