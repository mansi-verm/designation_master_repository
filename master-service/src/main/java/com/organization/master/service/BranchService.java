package com.organization.master.service;

import com.organization.master.dto.BranchDto;
import com.organization.master.dto.BranchRequestDto;
import com.organization.master.entity.Branch;
import com.organization.master.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;

    @CacheEvict(value = "masterBranches", allEntries = true)
    public BranchDto save(BranchRequestDto request) {
        if (branchRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Branch already exists");
        }
        Branch branch = new Branch();
        branch.setName(request.getName().trim());
        branch.setStatus(true);
        return mapToDto(branchRepository.save(branch));
    }

    @CacheEvict(value = "masterBranches", allEntries = true)
    public BranchDto update(Long id, BranchRequestDto request) {
        Branch branch = branchRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Branch not found"));
        if (branchRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new IllegalArgumentException("Branch already exists");
        }
        branch.setName(request.getName().trim());
        return mapToDto(branchRepository.save(branch));
    }

    public List<BranchDto> getBranches() {
        return branchRepository.findAllByOrderByNameAsc().stream().map(this::mapToDto).toList();
    }

    @Cacheable(value = "masterBranches", key = "'active'")
    public List<BranchDto> getActiveBranches() {
        return branchRepository.findByStatusTrueOrderByNameAsc().stream().map(this::mapToDto).toList();
    }

    private BranchDto mapToDto(Branch branch) {
        return new BranchDto(branch.getId(), branch.getName(), branch.getStatus());
    }
}