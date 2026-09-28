package com.organization.master.controller;

import com.organization.master.dto.BranchDto;
import com.organization.master.dto.BranchRequestDto;
import com.organization.master.service.BranchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/branch")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @PostMapping("/save")
    public BranchDto save(@Valid @RequestBody BranchRequestDto request) {

        return branchService.save(request);
    }

    @PutMapping("/update/{id}")
    public BranchDto update(@PathVariable Long id, @Valid @RequestBody BranchRequestDto request) {

        return branchService.update(id, request);
    }

    @GetMapping("/list")
    public List<BranchDto> getBranches() {
        return branchService.getBranches();
    }

    @GetMapping("/active")
    public List<BranchDto> getActiveBranches() {
        return branchService.getActiveBranches();
    }
}