//package com.organization.designation_master.service;
//
//import com.organization.designation_master.client.CommonServiceClient;
//import com.organization.designation_master.dto.*;
//import com.organization.designation_master.entity.Designation;
//import com.organization.designation_master.exception.DuplicateDesignationException;
//import com.organization.designation_master.repository.DesignationRepository;
//import jakarta.validation.ConstraintViolation;
//import jakarta.validation.Validator;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.apache.poi.ss.usermodel.Row;
//import org.apache.poi.ss.usermodel.Sheet;
//import org.apache.poi.ss.usermodel.Workbook;
//import org.apache.poi.ss.usermodel.WorkbookFactory;
//import org.springframework.beans.BeanUtils;
//import org.springframework.http.ResponseEntity;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.ByteArrayInputStream;
//import java.io.ByteArrayOutputStream;
//import java.io.IOException;
//import java.time.LocalDateTime;
//import java.util.Base64;
//import java.util.List;
//import java.util.Objects;
//import java.util.Set;
//import java.util.stream.Collectors;
//import java.util.stream.IntStream;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class ExcelProcessorService {
//
//    private final DesignationRepository designationRepository;
//    private final Validator validator;
//    private final CommonServiceClient commonServiceClient;
//
//    public ApiResponse<List<ExcelUploadResultDto>> validateExcel(MultipartFile file) throws IOException {
//        if (file == null || file.isEmpty()) {
//            throw new IllegalArgumentException("File cannot be empty");
//        }
//        String base64File = commonServiceClient.readExcel(file);
//        if (base64File == null || base64File.isBlank()) {
//            throw new IllegalArgumentException("Excel file could not be read");
//        }
//        byte[] fileBytes = Base64.getDecoder().decode(base64File);
//        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(fileBytes))) {
//            Sheet sheet = workbook.getSheetAt(0);
//            List<ExcelUploadResultDto> results = IntStream.range(2, sheet.getLastRowNum() + 1).mapToObj(sheet::getRow).filter(Objects::nonNull).map(row -> {
//                int rowNo = row.getRowNum() + 1;
//                try {
//                    DesignationRequestDto request = DesignationExcelDto.toRequest(row);
//                    Set<ConstraintViolation<DesignationRequestDto>> errors = validator.validate(request);
//                    if (!errors.isEmpty()) {
//                        return new ExcelUploadResultDto(rowNo, false, true, false, errors.iterator().next().getMessage(), "ERROR", "ERROR");
//                    }
//                    validateExcelBusinessRules(request);
//                    return new ExcelUploadResultDto(rowNo, true, false, false, "Validation successful", "VALID", "SUCCESS");
//                } catch (DuplicateDesignationException e) {
//                    return new ExcelUploadResultDto(rowNo, false, false, true, e.getMessage(), "DUPLICATE", "ERROR");
//                } catch (Exception e) {
//                    return new ExcelUploadResultDto(rowNo, false, true, false, e.getMessage(), "ERROR", "ERROR");
//                }
//            }).collect(Collectors.toList());
//            return ApiResponse.success("Excel validation completed", results);
//        }
//    }
//
//    public ApiResponse<List<ExcelUploadResultDto>> importExcel(MultipartFile file) throws IOException {
//        if (file == null || file.isEmpty()) {
//            throw new IllegalArgumentException("File cannot be empty");
//        }
//        String base64File = commonServiceClient.readExcel(file);
//        if (base64File == null || base64File.isBlank()) {
//            throw new IllegalArgumentException("Excel file could not be read");
//        }
//        byte[] fileBytes = Base64.getDecoder().decode(base64File);
//        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(fileBytes))) {
//            Sheet sheet = workbook.getSheetAt(0);
//            List<ExcelUploadResultDto> results = IntStream.range(2, sheet.getLastRowNum() + 1).mapToObj(sheet::getRow).filter(Objects::nonNull).map(row -> {
//                int rowNo = row.getRowNum() + 1;
//                try {
//                    DesignationRequestDto request = DesignationExcelDto.toRequest(row);
//                    Set<ConstraintViolation<DesignationRequestDto>> errors = validator.validate(request);
//                    if (!errors.isEmpty()) {
//                        return new ExcelUploadResultDto(rowNo, false, true, false, errors.iterator().next().getMessage(), "ERROR", "ERROR");
//                    }
//                    validateExcelBusinessRules(request);
//                    saveExcelDesignation(request);
//                    return new ExcelUploadResultDto(rowNo, true, false, false, "Data uploaded successfully", "UPLOADED", "SUCCESS");
//                } catch (DuplicateDesignationException e) {
//                    return new ExcelUploadResultDto(rowNo, false, false, true, e.getMessage(), "DUPLICATE", "ERROR");
//                } catch (Exception e) {
//                    return new ExcelUploadResultDto(rowNo, false, true, false, e.getMessage(), "ERROR", "ERROR");
//                }
//            }).collect(Collectors.toList());
//
//            int total = results.size();
//            int uploaded = (int) results.stream().filter(ExcelUploadResultDto::isCorrectData).count();
//            int incorrect = (int) results.stream().filter(ExcelUploadResultDto::isIncorrectData).count();
//            int duplicate = (int) results.stream().filter(ExcelUploadResultDto::isDuplicateData).count();
//            long active = 0;
//            long inactive = 0;
//
//            for (int i = 0; i < results.size(); i++) {
//                ExcelUploadResultDto result = results.get(i);
//                if (!result.isCorrectData()) {
//                    continue;
//                }
//                Row row = sheet.getRow(i + 2);
//                if (row == null) {
//                    continue;
//                }
//                try {
//                    DesignationRequestDto request = DesignationExcelDto.toRequest(row);
//                    if (Boolean.TRUE.equals(request.getStatus())) {
//                        active++;
//                    } else {
//                        inactive++;
//                    }
//                } catch (Exception ignored) {
//                }
//            }
//
//            String summary = "Excel Import Completed\n\n" + "Total Rows: " + total + "\n" + "Uploaded Successfully: " + uploaded + "\n" + "Incorrect: " + incorrect + "\n" + "Duplicate: " + duplicate + "\n\n" + "Active: " + active + "\n" + "Inactive: " + inactive;
//
//            if (uploaded > 0) {
//                try {
//                    byte[] resultExcel = createNotificationExcel(workbook, sheet, results);
//                    String attachmentData = Base64.getEncoder().encodeToString(resultExcel);
//                    commonServiceClient.createNotification(new NotificationRequestDto("Excel Import Completed", summary, "Admin", true, "Excel_Import_Result.xlsx", attachmentData));
//                } catch (Exception e) {
//                    log.error("Failed to create Excel import notification", e);
//                }
//            }
//
//            return ApiResponse.success("Excel processed successfully", results);
//        }
//    }
//
//    private void validateExcelBusinessRules(DesignationRequestDto request) {
//        if (designationRepository.existsDuplicate(request.getDesignationCode(), request.getDesignationName(), request.getDepartmentId(), request.getId())) {
//            throw new DuplicateDesignationException("Duplicate Code or Name!");
//        }
//        if (request.getMinExperience() != null && request.getMaxExperience() != null && request.getMinExperience() > request.getMaxExperience()) {
//            throw new IllegalArgumentException("Min can't be greater than max");
//        }
//        Long parentId = request.getParentDesignationId();
//        if (parentId != null && parentId.equals(request.getId())) {
//            throw new IllegalArgumentException("Parent cannot be same as current");
//        }
//        if (parentId != null) {
//            Designation parent = designationRepository.findByIdAndIsDeletedFalse(parentId).orElseThrow(() -> new IllegalArgumentException("Parent designation not found"));
//            if (!Objects.equals(parent.getDepartmentId(), request.getDepartmentId())) {
//                throw new IllegalArgumentException("Parent must belong to the same department");
//            }
//        }
//    }
//
//    private void saveExcelDesignation(DesignationRequestDto request) {
//        Designation designation = new Designation();
//        BeanUtils.copyProperties(request, designation, "id");
//        designation.setDeleted(false);
//        designation.setCreatedAt(LocalDateTime.now());
//        designation.setUpdatedAt(LocalDateTime.now());
//        designationRepository.save(designation);
//    }
//
//
//    private byte[] createNotificationExcel(Workbook workbook, Sheet sheet, List<ExcelUploadResultDto> results) throws IOException {
//        Row header = sheet.getRow(1);
//        if (header == null) {
//            return writeWorkbook(workbook);
//        }
//
//        int startColumn = header.getLastCellNum();
//
//        header.createCell(startColumn).setCellValue("Result");
//        header.createCell(startColumn + 1).setCellValue("Action");
//        header.createCell(startColumn + 2).setCellValue("Status");
//        header.createCell(startColumn + 3).setCellValue("Comment");
//
//        for (int i = 0; i < results.size(); i++) {
//            ExcelUploadResultDto result = results.get(i);
//            Row row = sheet.getRow(i + 2);
//
//            if (row == null) {
//                continue;
//            }
//
//            String resultValue = result.isCorrectData() ? "SUCCESS" : "ERROR";
//
//            String action = result.getAction();
//            String status = result.getStatus();
//            String comment = result.getRowComment();
//
//            if (status == null || status.isBlank()) {
//                try {
//                    DesignationRequestDto request = DesignationExcelDto.toRequest(row);
//                    status = Boolean.TRUE.equals(request.getStatus()) ? "ACTIVE" : "INACTIVE";
//                } catch (Exception ignored) {
//                    status = "";
//                }
//            }
//
//            row.createCell(startColumn).setCellValue(resultValue);
//            row.createCell(startColumn + 1).setCellValue(action == null ? "" : action);
//            row.createCell(startColumn + 2).setCellValue(status);
//            row.createCell(startColumn + 3).setCellValue(comment == null ? "" : comment);
//        }
//
//        return writeWorkbook(workbook);
//    }
//
//    private byte[] writeWorkbook(Workbook workbook) throws IOException {
//        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
//            workbook.write(output);
//            return output.toByteArray();
//        }
//    }
//
//    public byte[] downloadTemplate() throws IOException {
//        List<String> headers = getHeaders();
//        List<String> mandatory = getMandatoryHeaders();
//        List<List<String>> data = List.of(List.of("DES001", "Software Developer", "SDE", "1", "5", "", "IT", "Full Time", "A", "1", "3", "Responsible for software development and maintenance.", "Java, Spring Boot, React", "1, 2", "true", "", "Sample designation"));
//        ExcelRequestDto request = new ExcelRequestDto("Designation", headers, mandatory, data);
//        ResponseEntity<byte[]> response = commonServiceClient.downloadTemplate(request);
//        if (response == null || response.getBody() == null) {
//            throw new IOException("Template file is empty");
//        }
//        return response.getBody();
//    }
//
//    public byte[] downloadExcel(DesignationSearchRequestDto request, String search, boolean sendToEmail) throws IOException {
//        List<String> headers = getHeaders();
//        List<String> mandatory = getMandatoryHeaders();
//        LocalDateTime fromDate = null;
//        LocalDateTime toDate = null;
//        if (request != null && request.getFromDate() != null) {
//            fromDate = request.getFromDate().atStartOfDay();
//        }
//        if (request != null && request.getToDate() != null) {
//            toDate = request.getToDate().plusDays(1).atStartOfDay();
//        }
//        String safeSearch = search == null ? "" : search.trim();
//        List<Designation> designations = designationRepository.findForExcel(request != null ? request.getDepartmentId() : null, request != null ? request.getDesignationLevel() : null, request != null ? request.getGrade() : null, request != null ? request.getStatus() : null, fromDate, toDate, safeSearch);
//        List<List<String>> data = designations.stream().map(d -> List.of(value(d.getDesignationCode()), value(d.getDesignationName()), value(d.getShortName()), value(d.getDepartmentId()), value(d.getDesignationLevel()), value(d.getParentDesignationId()), value(d.getJobCategory()), value(d.getEmploymentType()), value(d.getGrade()), value(d.getMinExperience()), value(d.getMaxExperience()), value(d.getDescription()), d.getSkills() == null ? "" : String.join(", ", d.getSkills()), d.getBranchIds() == null ? "" : String.join(", ", d.getBranchIds()), String.valueOf(d.isStatus()), value(d.getAttachments()), value(d.getRemarks()))).toList();
//        ExcelRequestDto excelRequest = new ExcelRequestDto("Designation", headers, mandatory, data);
//        ResponseEntity<byte[]> response = commonServiceClient.downloadTemplate(excelRequest);
//        if (response == null || response.getBody() == null) {
//            throw new IOException("Excel file is empty");
//        }
//        byte[] file = response.getBody();
//        long total = designations.size();
//        long active = designations.stream().filter(Designation::isStatus).count();
//        long inactive = total - active;
//        String dateRange = request != null && request.getFromDate() != null && request.getToDate() != null ? request.getFromDate() + " to " + request.getToDate() : "All available records";
//        String summary = "Excel Download Completed\n\n" + "Date Range: " + dateRange + "\n" + "Total Designations: " + total + "\n" + "Active: " + active + "\n" + "Inactive: " + inactive + "\n\nFile: Designation.xlsx";
//        try {
//            if (sendToEmail) {
//                String attachmentData = Base64.getEncoder().encodeToString(file);
//                commonServiceClient.createNotification(new NotificationRequestDto("Excel Downloaded", summary + "\n\n" + "The requested Excel file " + "has been sent to your configured email.", "Admin", true, "Designation.xlsx", attachmentData));
//                log.info("Designation Excel sent to email. Records: {}, Range: {}", total, dateRange);
//                return null;
//            }
//            commonServiceClient.createNotification(new NotificationRequestDto("Excel Downloaded", summary, "Admin", false, null, null));
//            return file;
//        } catch (Exception e) {
//            log.error("Failed to create Excel download notification", e);
//            if (sendToEmail) {
//                return null;
//            }
//            return file;
//        }
//    }
//
//    public ApiResponse<PageResponseDto<NotificationResponseDto>> getNotifications(int page, int size) {
//        return commonServiceClient.getNotifications(page, size);
//    }
//
//    public List<String> getHeaders() {
//        return List.of("Designation Code", "Designation Name", "Short Name", "Department", "Designation Level", "Parent Designation", "Job Category", "Employment Type", "Grade", "Minimum Experience", "Maximum Experience", "Description", "Skills", "Applicable Branch", "Status", "Attachments", "Remarks");
//    }
//
//    private List<String> getMandatoryHeaders() {
//        return List.of("Designation Code", "Designation Name", "Department", "Designation Level", "Job Category", "Status");
//    }
//
//    private String value(Object value) {
//        return value == null ? "" : String.valueOf(value);
//    }
//}
package com.organization.designation_master.service;

import com.organization.designation_master.client.CommonServiceClient;
import com.organization.designation_master.client.MasterServiceClient;
import com.organization.designation_master.dto.*;
import com.organization.designation_master.entity.Designation;
import com.organization.designation_master.exception.DuplicateDesignationException;
import com.organization.designation_master.repository.DesignationRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelProcessorService {

    private final DesignationRepository designationRepository;
    private final Validator validator;
    private final CommonServiceClient commonServiceClient;
    private final MasterServiceClient masterServiceClient;

    public ApiResponse<List<ExcelUploadResultDto>> validateExcel(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        String base64File = commonServiceClient.readExcel(file);
        if (base64File == null || base64File.isBlank()) {
            throw new IllegalArgumentException("Excel file could not be read");
        }
        byte[] fileBytes = Base64.getDecoder().decode(base64File);
        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(fileBytes))) {
            Sheet sheet = workbook.getSheetAt(0);
            List<ExcelUploadResultDto> results = IntStream.range(2, sheet.getLastRowNum() + 1).mapToObj(sheet::getRow).filter(Objects::nonNull).map(row -> {
                int rowNo = row.getRowNum() + 1;
                try {
                    DesignationRequestDto request = DesignationExcelDto.toRequest(row);
                    Set<ConstraintViolation<DesignationRequestDto>> errors = validator.validate(request);
                    if (!errors.isEmpty()) {
                        return new ExcelUploadResultDto(rowNo, false, true, false, errors.iterator().next().getMessage(), "ERROR", "ERROR");
                    }
                    validateExcelBusinessRules(request);
                    return new ExcelUploadResultDto(rowNo, true, false, false, "Validation successful", "VALID", "SUCCESS");
                } catch (DuplicateDesignationException e) {
                    return new ExcelUploadResultDto(rowNo, false, false, true, e.getMessage(), "DUPLICATE", "ERROR");
                } catch (Exception e) {
                    return new ExcelUploadResultDto(rowNo, false, true, false, e.getMessage(), "ERROR", "ERROR");
                }
            }).collect(Collectors.toList());
            return ApiResponse.success("Excel validation completed", results);
        }
    }

    public ApiResponse<List<ExcelUploadResultDto>> importExcel(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        String base64File = commonServiceClient.readExcel(file);
        if (base64File == null || base64File.isBlank()) {
            throw new IllegalArgumentException("Excel file could not be read");
        }
        byte[] fileBytes = Base64.getDecoder().decode(base64File);
        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(fileBytes))) {
            Sheet sheet = workbook.getSheetAt(0);
            List<ExcelUploadResultDto> results = IntStream.range(2, sheet.getLastRowNum() + 1).mapToObj(sheet::getRow).filter(Objects::nonNull).map(row -> {
                int rowNo = row.getRowNum() + 1;
                try {
                    DesignationRequestDto request = DesignationExcelDto.toRequest(row);
                    Set<ConstraintViolation<DesignationRequestDto>> errors = validator.validate(request);
                    if (!errors.isEmpty()) {
                        return new ExcelUploadResultDto(rowNo, false, true, false, errors.iterator().next().getMessage(), "ERROR", "ERROR");
                    }
                    validateExcelBusinessRules(request);
                    saveExcelDesignation(request);
                    return new ExcelUploadResultDto(rowNo, true, false, false, "Data uploaded successfully", "UPLOADED", "SUCCESS");
                } catch (DuplicateDesignationException e) {
                    return new ExcelUploadResultDto(rowNo, false, false, true, e.getMessage(), "DUPLICATE", "ERROR");
                } catch (Exception e) {
                    return new ExcelUploadResultDto(rowNo, false, true, false, e.getMessage(), "ERROR", "ERROR");
                }
            }).collect(Collectors.toList());

            int total = results.size();
            int uploaded = (int) results.stream().filter(ExcelUploadResultDto::isCorrectData).count();
            int incorrect = (int) results.stream().filter(ExcelUploadResultDto::isIncorrectData).count();
            int duplicate = (int) results.stream().filter(ExcelUploadResultDto::isDuplicateData).count();
            long active = 0;
            long inactive = 0;

            for (int i = 0; i < results.size(); i++) {
                ExcelUploadResultDto result = results.get(i);
                if (!result.isCorrectData()) {
                    continue;
                }
                Row row = sheet.getRow(i + 2);
                if (row == null) {
                    continue;
                }
                try {
                    DesignationRequestDto request = DesignationExcelDto.toRequest(row);
                    if (Boolean.TRUE.equals(request.getStatus())) {
                        active++;
                    } else {
                        inactive++;
                    }
                } catch (Exception ignored) {
                }
            }

            String summary = "Excel Import Completed\n\n" + "Total Rows: " + total + "\n" + "Uploaded Successfully: " + uploaded + "\n" + "Incorrect: " + incorrect + "\n" + "Duplicate: " + duplicate + "\n\n" + "Active: " + active + "\n" + "Inactive: " + inactive;

            if (uploaded > 0) {
                try {
                    byte[] resultExcel = createNotificationExcel(workbook, sheet, results);
                    String attachmentData = Base64.getEncoder().encodeToString(resultExcel);
                    commonServiceClient.createNotification(new NotificationRequestDto("Excel Import Completed", summary, "Admin", true, "Excel_Import_Result.xlsx", attachmentData));
                } catch (Exception e) {
                    log.error("Failed to create Excel import notification", e);
                }
            }

            return ApiResponse.success("Excel processed successfully", results);
        }
    }

    private void validateExcelBusinessRules(DesignationRequestDto request) {
        if (designationRepository.existsDuplicate(request.getDesignationCode(), request.getDesignationName(), request.getDepartmentId(), request.getId())) {
            throw new DuplicateDesignationException("Duplicate Code or Name!");
        }
        if (request.getMinExperience() != null && request.getMaxExperience() != null && request.getMinExperience() > request.getMaxExperience()) {
            throw new IllegalArgumentException("Min can't be greater than max");
        }
        Long parentId = request.getParentDesignationId();
        if (parentId != null && parentId.equals(request.getId())) {
            throw new IllegalArgumentException("Parent cannot be same as current");
        }
        if (parentId != null) {
            Designation parent = designationRepository.findByIdAndIsDeletedFalse(parentId).orElseThrow(() -> new IllegalArgumentException("Parent designation not found"));
            if (!Objects.equals(parent.getDepartmentId(), request.getDepartmentId())) {
                throw new IllegalArgumentException("Parent must belong to the same department");
            }
        }
    }

    private void saveExcelDesignation(DesignationRequestDto request) {
        Designation designation = new Designation();
        BeanUtils.copyProperties(request, designation, "id");
        designation.setDeleted(false);
        designation.setCreatedAt(LocalDateTime.now());
        designation.setUpdatedAt(LocalDateTime.now());
        designationRepository.save(designation);
    }


    private byte[] createNotificationExcel(Workbook workbook, Sheet sheet, List<ExcelUploadResultDto> results) throws IOException {
        Row header = sheet.getRow(1);
        if (header == null) {
            return writeWorkbook(workbook);
        }

        int startColumn = header.getLastCellNum();

        header.createCell(startColumn).setCellValue("Result");
        header.createCell(startColumn + 1).setCellValue("Action");
        header.createCell(startColumn + 2).setCellValue("Status");
        header.createCell(startColumn + 3).setCellValue("Comment");

        for (int i = 0; i < results.size(); i++) {
            ExcelUploadResultDto result = results.get(i);
            Row row = sheet.getRow(i + 2);

            if (row == null) {
                continue;
            }

            String resultValue = result.isCorrectData() ? "SUCCESS" : "ERROR";

            String action = result.getAction();
            String status = result.getStatus();
            String comment = result.getRowComment();

            if (status == null || status.isBlank()) {
                try {
                    DesignationRequestDto request = DesignationExcelDto.toRequest(row);
                    status = Boolean.TRUE.equals(request.getStatus()) ? "ACTIVE" : "INACTIVE";
                } catch (Exception ignored) {
                    status = "";
                }
            }

            row.createCell(startColumn).setCellValue(resultValue);
            row.createCell(startColumn + 1).setCellValue(action == null ? "" : action);
            row.createCell(startColumn + 2).setCellValue(status);
            row.createCell(startColumn + 3).setCellValue(comment == null ? "" : comment);
        }

        return writeWorkbook(workbook);
    }

    private byte[] writeWorkbook(Workbook workbook) throws IOException {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            workbook.write(output);
            return output.toByteArray();
        }
    }

    public byte[] downloadTemplate() throws IOException {
        List<String> headers = getHeaders();
        List<String> mandatory = getMandatoryHeaders();
        List<List<String>> data = List.of(List.of("DES001", "Software Developer", "SDE", "1", "5", "", "IT", "Full Time", "A", "1", "3", "Responsible for software development and maintenance.", "Java, Spring Boot, React", "1, 2", "true", "", "Sample designation"));
        ExcelRequestDto request = new ExcelRequestDto("Designation", headers, mandatory, data);
        ResponseEntity<byte[]> response = commonServiceClient.downloadTemplate(request);
        if (response == null || response.getBody() == null) {
            throw new IOException("Template file is empty");
        }
        return response.getBody();
    }

    public byte[] downloadExcel(DesignationSearchRequestDto request, String search, boolean sendToEmail) throws IOException {
        List<String> headers = getHeaders();
        List<String> mandatory = getMandatoryHeaders();
        LocalDateTime fromDate = null;
        LocalDateTime toDate = null;
        if (request != null && request.getFromDate() != null) {
            fromDate = request.getFromDate().atStartOfDay();
        }
        if (request != null && request.getToDate() != null) {
            toDate = request.getToDate().plusDays(1).atStartOfDay();
        }
        String safeSearch = search == null ? "" : search.trim();
        List<Designation> designations = designationRepository.findForExcel(request != null ? request.getDepartmentId() : null, request != null ? request.getDesignationLevel() : null, request != null ? request.getGrade() : null, request != null ? request.getStatus() : null, fromDate, toDate, safeSearch);
        DropdownDto dropdowns = loadDropdowns();
        Map<String, String> departmentNames = dropdowns.getDepartments().stream().filter(x -> x.getId() != null).collect(Collectors.toMap(x -> String.valueOf(x.getId()), x -> value(x.getName()), (a, b) -> a));
        Map<String, String> skillNames = dropdowns.getSkills().stream().filter(x -> x.getId() != null).collect(Collectors.toMap(x -> String.valueOf(x.getId()), x -> value(x.getName()), (a, b) -> a));
        Map<String, String> branchNames = dropdowns.getBranches().stream().filter(x -> x.getId() != null).collect(Collectors.toMap(x -> String.valueOf(x.getId()), x -> value(x.getName()), (a, b) -> a));
        Set<Long> parentIds = designations.stream().map(Designation::getParentDesignationId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<String, String> parentNames = designationRepository.findAllById(parentIds).stream().collect(Collectors.toMap(x -> String.valueOf(x.getId()), x -> value(x.getDesignationName()), (a, b) -> a));
        List<List<String>> data = designations.stream().map(d -> List.of(value(d.getDesignationCode()), value(d.getDesignationName()), value(d.getShortName()), nameOf(d.getDepartmentId(), departmentNames), value(d.getDesignationLevel()), nameOf(d.getParentDesignationId(), parentNames), value(d.getJobCategory()), value(d.getEmploymentType()), value(d.getGrade()), value(d.getMinExperience()), value(d.getMaxExperience()), value(d.getDescription()), namesOf(d.getSkills(), skillNames), namesOf(d.getBranchIds(), branchNames), String.valueOf(d.isStatus()), value(d.getAttachments()), value(d.getRemarks()))).toList();
        ExcelRequestDto excelRequest = new ExcelRequestDto("Designation", headers, mandatory, data);
        ResponseEntity<byte[]> response = commonServiceClient.downloadTemplate(excelRequest);
        if (response == null || response.getBody() == null) {
            throw new IOException("Excel file is empty");
        }
        byte[] file = response.getBody();
        long total = designations.size();
        long active = designations.stream().filter(Designation::isStatus).count();
        long inactive = total - active;
        String dateRange = request != null && request.getFromDate() != null && request.getToDate() != null ? request.getFromDate() + " to " + request.getToDate() : "All available records";
        String summary = "Excel Download Completed\n\n" + "Date Range: " + dateRange + "\n" + "Total Designations: " + total + "\n" + "Active: " + active + "\n" + "Inactive: " + inactive + "\n\nFile: Designation.xlsx";
        try {
            if (sendToEmail) {
                String attachmentData = Base64.getEncoder().encodeToString(file);
                commonServiceClient.createNotification(new NotificationRequestDto("Excel Downloaded", summary + "\n\n" + "The requested Excel file " + "has been sent to your configured email.", "Admin", true, "Designation.xlsx", attachmentData));
                log.info("Designation Excel sent to email. Records: {}, Range: {}", total, dateRange);
                return null;
            }
            commonServiceClient.createNotification(new NotificationRequestDto("Excel Downloaded", summary, "Admin", false, null, null));
            return file;
        } catch (Exception e) {
            log.error("Failed to create Excel download notification", e);
            if (sendToEmail) {
                return null;
            }
            return file;
        }
    }

    public ApiResponse<PageResponseDto<NotificationResponseDto>> getNotifications(int page, int size) {
        return commonServiceClient.getNotifications(page, size);
    }

    public List<String> getHeaders() {
        return List.of("Designation Code", "Designation Name", "Short Name", "Department", "Designation Level", "Parent Designation", "Job Category", "Employment Type", "Grade", "Minimum Experience", "Maximum Experience", "Description", "Skills", "Applicable Branch", "Status", "Attachments", "Remarks");
    }

    private List<String> getMandatoryHeaders() {
        return List.of("Designation Code", "Designation Name", "Department", "Designation Level", "Job Category", "Status");
    }

    private String value(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private DropdownDto loadDropdowns() {
        try {
            DropdownDto dropdowns = masterServiceClient.getDropdowns();
            return dropdowns != null ? dropdowns : new DropdownDto();
        } catch (Exception e) {
            log.warn("Could not load master dropdowns for Excel export, IDs will be used", e);
            return new DropdownDto();
        }
    }

    private String nameOf(Object id, Map<String, String> names) {
        if (id == null) return "";
        String key = String.valueOf(id);
        return names.getOrDefault(key, key);
    }

    private String namesOf(List<String> ids, Map<String, String> names) {
        if (ids == null || ids.isEmpty()) return "";
        return ids.stream().map(id -> names.getOrDefault(String.valueOf(id).trim(), String.valueOf(id).trim())).collect(Collectors.joining(", "));
    }
}