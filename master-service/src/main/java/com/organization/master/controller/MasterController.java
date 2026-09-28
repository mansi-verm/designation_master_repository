
package com.organization.master.controller;

import com.organization.master.dto.DropdownDto;
import com.organization.master.service.BranchService;
import com.organization.master.service.DepartmentService;
import com.organization.master.service.SkillService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/master")
@RequiredArgsConstructor
public class MasterController {

    private final DepartmentService departmentService;
    private final SkillService skillService;
    private final BranchService branchService;

    @GetMapping("/dropdowns")
    public DropdownDto getDropdowns() {
        log.info("Fetching master dropdowns");
        DropdownDto dropdown = new DropdownDto();
        dropdown.setDepartments(departmentService.getActiveDepartments());
        dropdown.setSkills(skillService.getActiveSkills());
        dropdown.setBranches(branchService.getActiveBranches());
        return dropdown;
    }
}