package com.organization.designation_master.client;

import com.organization.designation_master.dto.DropdownDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "MASTER-SERVICE")
public interface MasterServiceClient {

    @GetMapping("/master/dropdowns")
    DropdownDto getDropdowns();
}