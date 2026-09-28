
package com.organization.common.excel;

import com.organization.common.dto.ExcelRequestDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.List;

@Component
public class CommonExcelService {
    public Workbook openWorkbook(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        return WorkbookFactory.create(file.getInputStream());
    }
    public Sheet getFirstSheet(Workbook workbook) {
        if (workbook == null || workbook.getNumberOfSheets() == 0) {
            throw new IllegalArgumentException("Excel sheet not found");
        }
        return workbook.getSheetAt(0);
    }
    public String getCellValue(Row row, int cellIndex) {
        if (row == null) {
            return "";
        }
        Cell cell = row.getCell(cellIndex);
        if (cell == null) {
            return "";
        }
        return new DataFormatter().formatCellValue(cell).trim();
    }
    public String readExcelAsBase64(MultipartFile file) throws IOException {
        try (Workbook workbook = openWorkbook(file)) {
            return workbookToBase64(workbook);
        }
    }

    public byte[] createTemplate(ExcelRequestDto request) throws IOException {
        validateRequest(request);
        try (Workbook workbook = new XSSFWorkbook()) {
            String sheetName = request.getSheetName() == null || request.getSheetName().isBlank() ? "Template" : request.getSheetName();
            Sheet sheet = workbook.createSheet(sheetName);
            List<String> headers = request.getHeaders();
            List<String> mandatory = request.getMandatory();
            List<List<String>> data = request.getData();
            CellStyle mandatoryStyle = createHeaderStyle(workbook, IndexedColors.RED);
            CellStyle optionalStyle = createHeaderStyle(workbook, IndexedColors.YELLOW);
            Row typeRow = sheet.createRow(0);
            Row headerRow = sheet.createRow(1);
            for (int i = 0; i < headers.size(); i++) {
                String header = headers.get(i);
                boolean isMandatory = mandatory != null && mandatory.contains(header);
                Cell typeCell = typeRow.createCell(i);
                typeCell.setCellValue(isMandatory ? "Mandatory" : "Optional");
                typeCell.setCellStyle(isMandatory ? mandatoryStyle : optionalStyle);
                headerRow.createCell(i).setCellValue(header == null ? "" : header);
            }

            if (data != null) {
                for (int i = 0; i < data.size(); i++) {
                    Row row = sheet.createRow(i + 2);
                    List<String> values = data.get(i);
                    for (int j = 0; j < headers.size(); j++) {
                        String value = "";
                        if (values != null && j < values.size() && values.get(j) != null) {
                            value = values.get(j);
                        }
                        row.createCell(j).setCellValue(value);
                    }
                }
            }
            for (int i = 0; i < headers.size(); i++) {
                sheet.autoSizeColumn(i);
            }
            return workbookToBytes(workbook);
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook, IndexedColors color) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(color.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    public byte[] workbookToBytes(Workbook workbook) throws IOException {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            workbook.write(output);
            return output.toByteArray();
        }
    }

    public String workbookToBase64(Workbook workbook) throws IOException {
        return Base64.getEncoder().encodeToString(workbookToBytes(workbook));
    }

    private void validateRequest(ExcelRequestDto request) {
        if (request == null) {
            throw new IllegalArgumentException("Excel request cannot be null");
        }
        if (request.getHeaders() == null || request.getHeaders().isEmpty()) {
            throw new IllegalArgumentException("Excel headers cannot be empty");
        }
    }
}