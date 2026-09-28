
package com.organization.designation_master.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExcelUploadResultDto {
    private int rowNumber;
    private boolean correctData;
    private boolean incorrectData;
    private boolean duplicateData;
    private String rowComment;
    private String action;
    private String status;
}
