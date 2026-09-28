package com.organization.designation_master.controller;

import com.organization.designation_master.dto.*;
import com.organization.designation_master.service.DesignationService;
import com.organization.designation_master.service.ExcelProcessorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/designation")
@RequiredArgsConstructor
public class DesignationController {

    private final DesignationService designationService;
    private final ExcelProcessorService excelProcessorService;

    @PostMapping("/save")
    public ApiResponse<List<DesignationResponseDto>> saveDesignation(@Valid @RequestBody List<DesignationRequestDto> requests) {
        return designationService.saveDesignation(requests);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT')")
    @PutMapping("/update")
    public ApiResponse<DesignationResponseDto> updateDesignation(@Valid @RequestBody DesignationRequestDto request) {
        return designationService.updateDesignation(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD', 'NORMAL')")
    @GetMapping("/list")
    public ApiResponse<Page<DesignationResponseDto>> getAllDesignations(@RequestParam(value = "page", defaultValue = "0") int page, @RequestParam(value = "size", defaultValue = "10") int size, @RequestParam(value = "sortBy", defaultValue = "id") String sortBy, @RequestParam(value = "direction", defaultValue = "asc") String direction, @RequestParam(value = "status", required = false) Boolean status) {
        return designationService.getDesignations(page, size, sortBy, direction, status);
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD', 'NORMAL')")
    @GetMapping("/history")
    public ApiResponse<List<DesignationHistoryDto>> getDesignationHistory() {
        return designationService.getHistory();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD', 'NORMAL')")
    @GetMapping("/{id}")
    public ApiResponse<DesignationResponseDto> getDesignationById(@PathVariable(name = "id") Long id) {
        return designationService.getDesignationById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ApiResponse<Void> deleteDesignation(@PathVariable(name = "id") Long id) {
        return designationService.deleteDesignationById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD', 'NORMAL')")
    @GetMapping("/count")
    public ApiResponse<Long> getDesignationCount(@RequestParam(value = "status", required = false) Boolean status) {
        return designationService.getDesignationCount(status);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD', 'NORMAL')")
    @GetMapping("/search")
    public ApiResponse<List<DesignationResponseDto>> search(DesignationSearchRequestDto request) {
        return designationService.search(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD', 'NORMAL')")
    @GetMapping("/dropdowns")
    public ApiResponse<DropdownDto> getDropdowns() {
        return designationService.getDropdowns();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT')")
    @PostMapping("/upload")
    public ApiResponse<List<ExcelUploadResultDto>> uploadExcel(@RequestParam("file") MultipartFile file) throws IOException {
        return excelProcessorService.validateExcel(file);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT')")
    @PostMapping("/import")
    public ApiResponse<List<ExcelUploadResultDto>> importExcel(@RequestParam("file") MultipartFile file) throws IOException {
        return excelProcessorService.importExcel(file);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD')")
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() throws IOException {
        return ResponseEntity.ok(excelProcessorService.downloadTemplate());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD')")
    @GetMapping("/download")
    public ResponseEntity<?> downloadExcel(DesignationSearchRequestDto request, @RequestParam(value = "search", required = false) String search, @RequestParam(value = "sendToEmail", defaultValue = "false") boolean sendToEmail) throws IOException {
        byte[] file = excelProcessorService.downloadExcel(request, search, sendToEmail);
        if (file == null) {
            return ResponseEntity.accepted().body(ApiResponse.success("Excel has been sent to your configured email", null));
        }
        return ResponseEntity.ok().body(file);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD', 'NORMAL')")
    @GetMapping("/excel-headers")
    public ApiResponse<List<String>> getExcelHeaders() {
        return ApiResponse.success("Headers fetched successfully", excelProcessorService.getHeaders());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD')")
    @GetMapping("/notifications")
    ApiResponse<PageResponseDto<NotificationResponseDto>> getNotifications(@RequestParam(name = "page", defaultValue = "0") int page, @RequestParam(name = "size", defaultValue = "10") int size) {
        return excelProcessorService.getNotifications(page, size);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD','NORMAL')")
    @GetMapping("/analytics")
    public ApiResponse<DesignationAnalyticsResponseDto> getAnalytics(DesignationSearchRequestDto request) {
        return designationService.getAnalytics(request);
    }

    @PostMapping("/{id}/attachments")
    public ApiResponse<DesignationResponseDto> uploadAttachments(@PathVariable("id") Long id, @RequestParam("files") List<MultipartFile> files) throws IOException {
        return designationService.uploadAttachments(id, files);
    }
}
