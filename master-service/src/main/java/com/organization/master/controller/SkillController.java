package com.organization.master.controller;

import com.organization.master.dto.SkillDto;
import com.organization.master.dto.SkillRequestDto;
import com.organization.master.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/skill")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @PostMapping("/save")
    public SkillDto save(@Valid @RequestBody SkillRequestDto request) {

        return skillService.save(request);
    }
    @PutMapping("/update/{id}")
    public SkillDto update(@PathVariable Long id, @Valid @RequestBody SkillRequestDto request) {
        return skillService.update(id, request);
    }

    @GetMapping("/list")
    public List<SkillDto> getSkills() {
        return skillService.getSkills();
    }

    @GetMapping("/active")
    public List<SkillDto> getActiveSkills() {
        return skillService.getActiveSkills();
    }
}