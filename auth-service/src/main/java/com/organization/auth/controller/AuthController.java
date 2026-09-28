package com.organization.auth.controller;

import com.organization.auth.dto.ApiResponse;
import com.organization.auth.dto.LoginRequest;
import com.organization.auth.dto.LoginResponse;
import com.organization.auth.dto.RegisterRequest;
import com.organization.auth.service.AuthService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User registered successfully", null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/test")
    public ResponseEntity<ApiResponse<String>> test() {
        log.info("Basic authentication test API called");
        return ResponseEntity.ok(ApiResponse.<String>success("Basic authentication successful", "Auth service working"));
    }

    @GetMapping("/jwt-test")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<String>> jwtTest() {
        log.info("JWT authentication test API called");
        return ResponseEntity.ok(ApiResponse.<String>success("JWT authentication successful", "JWT service working"));
    }

    @GetMapping("/user-name/{id}")
    public String getUserName(@PathVariable("id") Long id) {
        return authService.getUserName(id);
    }
}