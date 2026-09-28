package com.organization.designation_master;

import com.organization.common.config.CommonRedisConfig;
import com.organization.common.excel.CommonExcelService;
import com.organization.common.notification.CommonNotificationService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@EnableFeignClients
@Import({CommonRedisConfig.class, CommonExcelService.class, CommonNotificationService.class})
public class DesignationMasterApplication {

    public static void main(String[] args) {
        SpringApplication.run(DesignationMasterApplication.class, args);
        System.out.println("Application Running");
    }
}