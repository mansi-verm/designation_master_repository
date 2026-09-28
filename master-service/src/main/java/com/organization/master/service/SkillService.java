package com.organization.master.service;

import com.organization.master.dto.SkillDto;
import com.organization.master.dto.SkillRequestDto;
import com.organization.master.entity.Skill;
import com.organization.master.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;

    @CacheEvict(value = "masterSkills", allEntries = true)
    public SkillDto save(SkillRequestDto request) {
        if (skillRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Skill already exists");
        }
        Skill skill = new Skill();
        skill.setName(request.getName().trim());
        skill.setStatus(true);
        return mapToDto(skillRepository.save(skill));
    }

    @CacheEvict(value = "masterSkills", allEntries = true)
    public SkillDto update(Long id, SkillRequestDto request) {
        Skill skill = skillRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Skill not found"));
        if (skillRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new IllegalArgumentException("Skill already exists");
        }
        skill.setName(request.getName().trim());
        return mapToDto(skillRepository.save(skill));
    }

    public List<SkillDto> getSkills() {
        return skillRepository.findAllByOrderByNameAsc().stream().map(this::mapToDto).toList();
    }

    @Cacheable(value = "masterSkills", key = "'active'")
    public List<SkillDto> getActiveSkills() {
        return skillRepository.findByStatusTrueOrderByNameAsc().stream().map(this::mapToDto).toList();
    }

    private SkillDto mapToDto(Skill skill) {
        return new SkillDto(skill.getId(), skill.getName(), skill.getStatus());
    }
}