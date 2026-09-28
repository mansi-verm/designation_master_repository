package com.organization.master.controller;

import com.organization.master.dto.DepartmentDto;
import com.organization.master.dto.DepartmentRequestDto;
import com.organization.master.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/department")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping("/save")
    public DepartmentDto save(@Valid @RequestBody DepartmentRequestDto request) {

        return departmentService.save(request);
    }

    @PutMapping("/update/{id}")
    public DepartmentDto update(@PathVariable Long id, @Valid @RequestBody DepartmentRequestDto request) {

        return departmentService.update(id, request);
    }

    @GetMapping("/list")
    public List<DepartmentDto> getDepartments() {
        return departmentService.getDepartments();
    }

    @GetMapping("/active")
    public List<DepartmentDto> getActiveDepartments() {
        return departmentService.getActiveDepartments();
    }
}