package com.organization.auth.service;

import com.organization.auth.dto.LoginRequest;
import com.organization.auth.dto.LoginResponse;
import com.organization.auth.dto.RegisterRequest;
import com.organization.auth.entity.User;
import com.organization.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public void register(RegisterRequest request) {
        if (request == null || !StringUtils.hasText(request.getUsername()) || !StringUtils.hasText(request.getPassword())) {
            throw new IllegalArgumentException("Username and password are required");
        }
        String username = request.getUsername().trim();
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
//        String role = StringUtils.hasText(request.getRole()) ? request.getRole().trim().toUpperCase() : "USER";
        String role = StringUtils.hasText(request.getRole()) ? request.getRole().trim().toUpperCase() : "NORMAL";
        if (!Set.of("ADMIN", "MANAGEMENT", "HOD", "NORMAL").contains(role)) {
            throw new IllegalArgumentException("Role must be ADMIN, MANAGEMENT, HOD or NORMAL");
        }
        User user = User.builder().username(username).password(passwordEncoder.encode(request.getPassword())).role(role).enabled(true).build();
        userRepository.save(user);
        log.info("User registered successfully: {}", username);
    }

    public LoginResponse login(LoginRequest request) {

        if (request == null || !StringUtils.hasText(request.getUsername()) || !StringUtils.hasText(request.getPassword())) {
            throw new IllegalArgumentException("Username and password are required");
        }
        String username = request.getUsername().trim();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, request.getPassword()));
        User user = userRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("User not found"));
        UserDetails userDetails = org.springframework.security.core.userdetails.User.withUsername(user.getUsername()).password(user.getPassword()).roles(user.getRole()).disabled(!user.isEnabled()).build();
        String token = jwtService.generateToken(userDetails, user.getId());
        log.info("JWT generated successfully for user: {}", username);
        return LoginResponse.builder().token(token).userId(user.getId()).username(user.getUsername()).role(user.getRole()).build();
    }

    public String getUserName(Long id) {
        return userRepository.findById(id).map(User::getUsername).orElse("");
    }
}