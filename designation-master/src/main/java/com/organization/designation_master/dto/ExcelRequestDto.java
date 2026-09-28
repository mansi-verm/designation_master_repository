package com.organization.designation_master.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExcelRequestDto {

    private String sheetName;
    private List<String> headers;
    private List<String> mandatory;
    private List<List<String>> data;
}