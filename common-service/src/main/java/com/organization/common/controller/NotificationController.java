package com.organization.common.controller;

import com.organization.common.dto.ApiResponse;
import com.organization.common.dto.NotificationRequestDto;
import com.organization.common.dto.NotificationResponseDto;
import com.organization.common.notification.CommonNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/common/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final CommonNotificationService notificationService;

    @GetMapping
    public ApiResponse<Page<NotificationResponseDto>> getNotifications(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return notificationService.getNotifications(page, size);
    }

    @PostMapping
    public ApiResponse<String> createNotification(
            @RequestBody NotificationRequestDto request) {

        notificationService.createNotification(
                request.getSubject(),
                request.getSummary(),
                request.getRecipient(),
                request.isAttachment(),
                request.getAttachmentName(),
                request.getAttachmentData()
        );

        return ApiResponse.success("Notification created");
    }
}