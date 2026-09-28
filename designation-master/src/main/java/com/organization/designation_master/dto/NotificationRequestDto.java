package com.organization.designation_master.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDto {
    private String subject;
    private String summary;
    private String recipient;
    private boolean attachment;
    private String attachmentName;
    private String attachmentData;
}