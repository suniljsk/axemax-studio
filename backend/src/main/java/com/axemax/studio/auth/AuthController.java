package com.axemax.studio.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final JwtService jwtService;
    private final PasswordEncoder encoder;
    private final String adminEmail;
    private final String adminPasswordHash;

    public AuthController(JwtService jwtService, PasswordEncoder encoder,
        @Value("${app.admin.email}") String adminEmail,
        @Value("${app.admin.password}") String adminPassword) {
        this.jwtService = jwtService;
        this.encoder = encoder;
        this.adminEmail = adminEmail;
        this.adminPasswordHash = encoder.encode(adminPassword);
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        if (!adminEmail.equalsIgnoreCase(request.email()) || !encoder.matches(request.password(), adminPasswordHash)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return new TokenResponse(jwtService.createToken(adminEmail), "Bearer", 1800);
    }

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record TokenResponse(String accessToken, String tokenType, long expiresInSeconds) {}
}
