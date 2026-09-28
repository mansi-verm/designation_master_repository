package com.organization.common.notification;

import com.organization.common.dto.ApiResponse;
import com.organization.common.dto.NotificationResponseDto;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class CommonNotificationService {

    private final List<NotificationResponseDto> notifications = new CopyOnWriteArrayList<>();
    private final JavaMailSender mailSender;

    @Value("${notification.recipient:${MAIL_USERNAME:}}")
    private String notificationRecipient;

    public CommonNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void createNotification(String subject, String summary, String recipient, boolean attachment, String attachmentName, String attachmentData) {
        notifications.add(0, new NotificationResponseDto(System.currentTimeMillis(), subject, summary, recipient, LocalDateTime.now(), false, attachment, attachmentName, attachmentData));
        sendEmail(subject, summary, attachment, attachmentName, attachmentData);
    }

    private void sendEmail(String subject, String summary, boolean attachment, String attachmentName, String attachmentData) {
        if (notificationRecipient == null || notificationRecipient.isBlank()) {
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(notificationRecipient);
            helper.setSubject(subject);
            helper.setText(summary);
            if (attachment && attachmentData != null && !attachmentData.isBlank() && attachmentName != null && !attachmentName.isBlank()) {
                byte[] fileBytes = Base64.getDecoder().decode(attachmentData);
                helper.addAttachment(attachmentName, new ByteArrayResource(fileBytes));
            }
            mailSender.send(message);
        } catch (MessagingException | IllegalArgumentException e) {
            System.err.println("Failed to send notification email: " + e.getMessage());
        }
    }

    public ApiResponse<Page<NotificationResponseDto>> getNotifications(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        int start = Math.min(page * size, notifications.size());
        int end = Math.min(start + size, notifications.size());
        Page<NotificationResponseDto> result = new PageImpl<>(notifications.subList(start, end), pageRequest, notifications.size());
        return ApiResponse.success("Notifications fetched", result);
    }

    public void markAsRead(Long id) {
        notifications.stream().filter(notification -> notification.getId().equals(id)).findFirst().ifPresent(notification -> notification.setRead(true));
    }
}