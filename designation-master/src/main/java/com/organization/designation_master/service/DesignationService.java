package com.organization.designation_master.service;

import com.organization.designation_master.client.AuthClient;
import com.organization.designation_master.client.MasterServiceClient;
import com.organization.designation_master.dto.*;
import com.organization.designation_master.entity.Designation;
import com.organization.designation_master.entity.DesignationHistory;
import com.organization.designation_master.exception.DesignationNotFoundException;
import com.organization.designation_master.exception.DuplicateDesignationException;
import com.organization.designation_master.repository.DesignationHistoryRepository;
import com.organization.designation_master.repository.DesignationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DesignationService {
    private final DesignationRepository designationRepository;
    private final MasterServiceClient masterServiceClient;
    private final AuthClient authClient;
    private final DesignationHistoryRepository designationHistoryRepository;

    private static final String UPLOAD_DIR = "uploads/designations";

    //    @Transactional
//    @CacheEvict(value = {"designationById", "designationList", "designationDropdowns", "designationExcelDownload"}, allEntries = true)
//    public ApiResponse<DesignationResponseDto> saveDesignation(DesignationRequestDto req) {
//        try {
//            validateBusinessRules(req, null);
//            Designation d = new Designation();
//            BeanUtils.copyProperties(req, d, "id", "createdBy", "createdAt", "updatedBy", "updatedAt");
//            d.setDeleted(false);
//            LocalDateTime now = LocalDateTime.now();
//            d.setCreatedAt(now);
//            d.setUpdatedAt(now);
//            d.setCreatedBy(req.getCreatedBy());
//            d.setUpdatedBy(req.getUpdatedBy());
//            log.info("Creating designation. createdBy={}", req.getCreatedBy());
//            Designation saved = designationRepository.save(d);
//            saveHistory(saved, "CREATE", saved.getCreatedBy());
//            log.info("Designation created successfully. id={}, createdBy={}", saved.getId(), saved.getCreatedBy());
//            return ApiResponse.success("Created", mapToDto(saved));
//        } catch (Exception ex) {
//            log.error("Error while creating designation", ex);
//            throw ex;
//        }
//    }
    @Transactional
    @CacheEvict(value = {"designationById", "designationList", "designationDropdowns", "designationExcelDownload"}, allEntries = true)
    public ApiResponse<List<DesignationResponseDto>> saveDesignation(List<DesignationRequestDto> requests) {
        try {
            List<Designation> designations = new ArrayList<>();
            for (DesignationRequestDto req : requests) {
                validateBusinessRules(req, null);
                Designation d = new Designation();
                BeanUtils.copyProperties(req, d, "id", "createdBy", "createdAt", "updatedBy", "updatedAt");
                d.setDeleted(false);
                LocalDateTime now = LocalDateTime.now();
                d.setCreatedAt(now);
                d.setUpdatedAt(now);
                d.setCreatedBy(req.getCreatedBy());
                d.setUpdatedBy(req.getUpdatedBy());
                designations.add(d);
            }
            List<Designation> savedDesignations = designationRepository.saveAll(designations);
            for (Designation saved : savedDesignations) {
                saveHistory(saved, "CREATE", saved.getCreatedBy());
                log.info("Designation created successfully. id={}, createdBy={}", saved.getId(), saved.getCreatedBy());
            }
            List<DesignationResponseDto> response = savedDesignations.stream().map(this::mapToDto).toList();
            return ApiResponse.success("Designations created successfully", response);
        } catch (Exception ex) {
            log.error("Error while creating designations", ex);
            throw ex;
        }
    }

    @Transactional
    @CacheEvict(value = {"designationById", "designationList", "designationDropdowns", "designationExcelDownload"}, allEntries = true)
    public ApiResponse<DesignationResponseDto> updateDesignation(DesignationRequestDto req) {
        try {
            Long id = req.getId();
            validateBusinessRules(req, id);
            Designation d = designationRepository.findById(id).orElseThrow(() -> new DesignationNotFoundException("Designation not found"));
            BeanUtils.copyProperties(req, d, "id", "createdBy", "createdAt", "updatedBy", "updatedAt");
            d.setDeleted(false);
            d.setStatus(req.getStatus());
            d.setUpdatedAt(LocalDateTime.now());
            d.setUpdatedBy(req.getUpdatedBy());
            log.info("Updating designation. id={}, updatedBy={}", id, req.getUpdatedBy());
            Designation updated = designationRepository.save(d);
            saveHistory(updated, "UPDATE", updated.getUpdatedBy());
            log.info("Designation updated successfully. id={}, updatedBy={}", updated.getId(), updated.getUpdatedBy());
            return ApiResponse.success("Updated", mapToDto(updated));
        } catch (Exception ex) {
            log.error("Error while updating designation. id={}", req.getId(), ex);
            throw ex;
        }
    }

    @Cacheable(value = "designationById", key = "#p0")
    public ApiResponse<DesignationResponseDto> getDesignationById(Long id) {
        return ApiResponse.success("fetched", mapToDto(findActiveDesignation(id)));
    }

    @Transactional
    @CacheEvict(value = {"designationById", "designationList", "designationDropdowns", "designationExcelDownload"}, allEntries = true)
    public ApiResponse<Void> deleteDesignationById(Long id) {
        Designation designation = designationRepository.findById(id).orElseThrow(() -> new DesignationNotFoundException("Designation not found"));
        designation.setDeleted(true);
        designation.setStatus(false);
        designation.setUpdatedAt(LocalDateTime.now());
        Designation deleted = designationRepository.save(designation);
        saveHistory(deleted, "DELETE", deleted.getUpdatedBy());
        return ApiResponse.success("Deleted");
    }

    public ApiResponse<List<DesignationHistoryDto>> getHistory() {
        List<DesignationHistoryDto> response = designationHistoryRepository.findHistory();
        response.forEach(dto -> {
            dto.setCreatedByName(dto.getCreatedBy() == null ? null : authClient.getUserName(dto.getCreatedBy()));
            dto.setUpdatedByName(dto.getUpdatedBy() == null ? null : authClient.getUserName(dto.getUpdatedBy()));
            dto.setChangedByName(dto.getChangedBy() == null ? null : authClient.getUserName(dto.getChangedBy()));
        });
        return ApiResponse.success("History fetched", response);
    }

    private void saveHistory(Designation designation, String action, Long changedBy) {
        DesignationHistory history = new DesignationHistory();
        BeanUtils.copyProperties(designation, history);
        history.setDesignationId(designation.getId());
        history.setAction(action);
        history.setChangedBy(changedBy);
        history.setChangedAt(LocalDateTime.now());
        designationHistoryRepository.save(history);
    }

    public ApiResponse<Long> getDesignationCount(Boolean status) {
        Long count = status == null ? designationRepository.countAllActive() : designationRepository.countByStatus(status);
        return ApiResponse.success("fetched", count);
    }

    public ApiResponse<List<DesignationResponseDto>> search(DesignationSearchRequestDto req) {
        var data = designationRepository.search(req.getDepartmentId(), req.getDesignationLevel(), req.getGrade(), req.getStatus(), req.getFromDate() == null ? null : req.getFromDate().atStartOfDay(), req.getToDate() == null ? null : req.getToDate().plusDays(1).atStartOfDay()).stream().map(this::mapToDto).toList();
        return ApiResponse.success(data.isEmpty() ? "Not found" : "Fetched", data);
    }

    @Cacheable(value = "designationList", key = "#page + '-' + #size + '-' + #sortBy + '-' + #direction + '-' + #status")
    public ApiResponse<Page<DesignationResponseDto>> getDesignations(int page, int size, String sortBy, String direction, Boolean status) {
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<DesignationResponseDto> response = designationRepository.findDesignationList(status, pageable).map(this::mapToDto);
        return ApiResponse.success(response.isEmpty() ? "Not found" : "Fetched", response);
    }

    public ApiResponse<DropdownDto> getDropdowns() {
        return ApiResponse.success("Dropdowns fetched successfully", masterServiceClient.getDropdowns());
    }

    public void validateForExcel(DesignationRequestDto request) {
        validateBusinessRules(request, request.getId());
    }

    public ApiResponse<DesignationAnalyticsResponseDto> getAnalytics(DesignationSearchRequestDto r) {
        List<AnalyticsRowDto> data = designationRepository.findAnalyticsRows(r.getGrade(), r.getStatus(), r.getDepartmentId(), r.getDesignationLevel(), r.getFromDate() == null ? null : r.getFromDate().atStartOfDay(), r.getToDate() == null ? null : r.getToDate().plusDays(1).atStartOfDay());
        long total = data.size();
        long active = data.stream().filter(d -> Boolean.TRUE.equals(d.getStatus())).count();
        long inactive = total - active;
        DesignationAnalyticsResponseDto dto = new DesignationAnalyticsResponseDto();
        dto.setTotal(total);
        dto.setActive(active);
        dto.setInactive(inactive);
        dto.setActivePercentage(total == 0 ? 0 : active * 100.0 / total);
        dto.setGradeWise(data.stream().filter(d -> d.getGrade() != null).collect(Collectors.groupingBy(AnalyticsRowDto::getGrade, Collectors.counting())).entrySet().stream().map(e -> new DesignationAnalyticsResponseDto.ChartData(e.getKey(), e.getValue())).toList());
        dto.setStatusWise(List.of(new DesignationAnalyticsResponseDto.ChartData("Active", active), new DesignationAnalyticsResponseDto.ChartData("Inactive", inactive)));
        dto.setDateWise(data.stream().filter(d -> d.getCreatedAt() != null).collect(Collectors.groupingBy(d -> d.getCreatedAt().toLocalDate().toString(), Collectors.counting())).entrySet().stream().map(e -> new DesignationAnalyticsResponseDto.ChartData(e.getKey(), e.getValue())).toList());
        dto.setDepartmentWise(data.stream().filter(d -> d.getDepartmentId() != null).collect(Collectors.groupingBy(d -> String.valueOf(d.getDepartmentId()), Collectors.counting())).entrySet().stream().map(e -> new DesignationAnalyticsResponseDto.ChartData(e.getKey(), e.getValue())).toList());
        dto.setLevelWise(data.stream().filter(d -> d.getDesignationLevel() != null).collect(Collectors.groupingBy(d -> "Level " + d.getDesignationLevel(), Collectors.counting())).entrySet().stream().map(e -> new DesignationAnalyticsResponseDto.ChartData(e.getKey(), e.getValue())).toList());
        return ApiResponse.success("Analytics data fetched", dto);
    }

    private Designation findActiveDesignation(Long id) {
        return designationRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new DesignationNotFoundException("not found"));
    }

    private void validateBusinessRules(DesignationRequestDto request, Long id) {
        if (designationRepository.existsDuplicate(request.getDesignationCode(), request.getDesignationName(), request.getDepartmentId(), id))
            throw new DuplicateDesignationException("Duplicate Code or Name!");
        if (request.getMinExperience() != null && request.getMaxExperience() != null && request.getMinExperience() > request.getMaxExperience())
            throw new IllegalArgumentException("Min can't be greater than max");
        Long parentId = request.getParentDesignationId();
        if (parentId != null && parentId.equals(id))
            throw new IllegalArgumentException("Parent cannot be same as current");
        if (parentId != null && !findActiveDesignation(parentId).getDepartmentId().equals(request.getDepartmentId()))
            throw new IllegalArgumentException("Parent must belong to the same department");
    }


    public ApiResponse<DesignationResponseDto> uploadAttachments(Long id, List<MultipartFile> files) throws IOException {
        Designation designation = designationRepository.findById(id).orElseThrow(() -> new DesignationNotFoundException("Designation not found"));
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Please select at least one file");
        }
        Path folder = Paths.get(UPLOAD_DIR, id.toString());
        Files.createDirectories(folder);
        List<Map<String, Object>> attachments = Optional.ofNullable(designation.getAttachments()).map(ArrayList::new).orElseGet(ArrayList::new);
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            if (file.getSize() > 20 * 1024 * 1024) {
                throw new IllegalArgumentException("File size cannot exceed 20 MB");
            }
            String fileName = file.getOriginalFilename();
            if (fileName == null || fileName.isBlank()) {
                throw new IllegalArgumentException("Invalid file name");
            }
            String extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
            if (!List.of(".pdf", ".doc", ".docx", ".xls", ".xlsx").contains(extension)) {
                throw new IllegalArgumentException("Invalid file format");
            }
            String storedName = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), folder.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
            attachments.add(Map.of("id", UUID.randomUUID().toString(), "fileName", fileName, "storedName", storedName, "url", "/uploads/designations/" + id + "/" + storedName));
        }
        designation.setAttachments(attachments);
        return ApiResponse.success("Attachments uploaded successfully", mapToDto(designationRepository.save(designation)));
    }

    public DesignationResponseDto mapToDto(Designation designation) {
        DesignationResponseDto dto = new DesignationResponseDto();
        BeanUtils.copyProperties(designation, dto);
        if (designation.getCreatedBy() != null) {
            dto.setCreatedBy(authClient.getUserName(designation.getCreatedBy()));
        }
        if (designation.getUpdatedBy() != null) {
            dto.setUpdatedBy(authClient.getUserName(designation.getUpdatedBy()));
        }
        return dto;
    }
}