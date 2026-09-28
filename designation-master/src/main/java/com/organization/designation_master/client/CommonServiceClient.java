
package com.organization.designation_master.client;

import com.organization.common.dto.ApiResponse;
import com.organization.common.dto.ExcelRequestDto;
import com.organization.common.dto.NotificationResponseDto;
import com.organization.common.excel.CommonExcelService;
import com.organization.common.notification.CommonNotificationService;
import com.organization.designation_master.dto.NotificationRequestDto;
import com.organization.designation_master.dto.PageResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
@RequiredArgsConstructor
public class CommonServiceClient {
    private final CommonExcelService commonExcelService;
    private final CommonNotificationService commonNotificationService;
    public String readExcel(MultipartFile file) throws java.io.IOException {
        return commonExcelService.readExcelAsBase64(file);
    }
    public ResponseEntity<byte[]> downloadTemplate(com.organization.designation_master.dto.ExcelRequestDto request) throws java.io.IOException {
        ExcelRequestDto commonRequest = new ExcelRequestDto(request.getSheetName(), request.getHeaders(), request.getMandatory(), request.getData());
        byte[] data = commonExcelService.createTemplate(commonRequest);
        return ResponseEntity.ok().header("Content-Disposition", "attachment; filename=Designation.xlsx").body(data);
    }

    public Object createNotification(NotificationRequestDto request) {
        commonNotificationService.createNotification(request.getSubject(), request.getSummary(), request.getRecipient(), request.isAttachment(), request.getAttachmentName(), request.getAttachmentData());
        return null;
    }

    public com.organization.designation_master.dto.ApiResponse<PageResponseDto<com.organization.designation_master.dto.NotificationResponseDto>> getNotifications(int page, int size) {
        ApiResponse<org.springframework.data.domain.Page<NotificationResponseDto>> response = commonNotificationService.getNotifications(page, size);
        org.springframework.data.domain.Page<NotificationResponseDto> pageData = response.getData();
        PageResponseDto<com.organization.designation_master.dto.NotificationResponseDto> pageResponse = new PageResponseDto<>();
        pageResponse.setContent(pageData.getContent().stream().map(notification -> new com.organization.designation_master.dto.NotificationResponseDto(notification.getId(), notification.getSubject(), notification.getSummary(), notification.getRecipient(), notification.getCreatedAt(), notification.isRead(), notification.isHasAttachment(), notification.getAttachmentName(), notification.getAttachmentData())).toList());
        pageResponse.setNumber(pageData.getNumber());
        pageResponse.setSize(pageData.getSize());
        pageResponse.setTotalPages(pageData.getTotalPages());
        pageResponse.setTotalElements(pageData.getTotalElements());
        pageResponse.setNumberOfElements(pageData.getNumberOfElements());
        pageResponse.setFirst(pageData.isFirst());
        pageResponse.setLast(pageData.isLast());
        pageResponse.setEmpty(pageData.isEmpty());
        return com.organization.designation_master.dto.ApiResponse.success("Notifications fetched", pageResponse);
    }
}