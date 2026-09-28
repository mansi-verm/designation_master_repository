package com.organization.common.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NotificationRequestDto {
    private String subject;
    private String summary;
    private String recipient;
    private boolean attachment;
    private String attachmentName;
    private String attachmentData;
}