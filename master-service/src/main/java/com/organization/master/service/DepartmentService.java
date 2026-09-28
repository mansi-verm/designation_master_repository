package com.organization.master.service;

import com.organization.master.dto.DepartmentDto;
import com.organization.master.dto.DepartmentRequestDto;
import com.organization.master.entity.Department;
import com.organization.master.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @CacheEvict(value = "masterDepartments", allEntries = true)
    public DepartmentDto save(DepartmentRequestDto request) {
        if (departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Department already exists");
        }
        Department department = new Department();
        department.setName(request.getName().trim());
        department.setStatus(true);
        return mapToDto(departmentRepository.save(department));
    }

    @CacheEvict(value = "masterDepartments", allEntries = true)
    public DepartmentDto update(Long id, DepartmentRequestDto request) {
        Department department = departmentRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Department not found"));
        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new IllegalArgumentException("Department already exists");
        }
        department.setName(request.getName().trim());
        return mapToDto(departmentRepository.save(department));
    }

    public List<DepartmentDto> getDepartments() {
        return departmentRepository.findAllByOrderByNameAsc().stream().map(this::mapToDto).toList();
    }

    @Cacheable(value = "masterDepartments", key = "'active'")
    public List<DepartmentDto> getActiveDepartments() {
        return departmentRepository.findByStatusTrueOrderByNameAsc().stream().map(this::mapToDto).toList();
    }

    private DepartmentDto mapToDto(Department department) {
        return new DepartmentDto(department.getId(), department.getName(), department.getStatus());
    }
}