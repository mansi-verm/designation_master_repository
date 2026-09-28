package com.organization.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class NotificationResponseDto {
    private Long id;
    private String subject;
    private String summary;
    private String recipient;
    private LocalDateTime createdAt;
    private boolean read;
    private boolean hasAttachment;
    private String attachmentName;
    private String attachmentData;
}