package com.organization.common.controller;
import com.organization.common.dto.ExcelRequestDto;
import com.organization.common.excel.CommonExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/common/excel")
@RequiredArgsConstructor
public class CommonController {

    private final CommonExcelService commonExcelService;

    @PostMapping(value = "/read", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String readExcel(@RequestParam("file") MultipartFile file) throws IOException {
        return commonExcelService.readExcelAsBase64(file);
    }

    @PostMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate(@RequestBody ExcelRequestDto request) throws IOException {
        byte[] file = commonExcelService.createTemplate(request);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Template.xlsx").contentType(MediaType.APPLICATION_OCTET_STREAM).body(file);
    }

}