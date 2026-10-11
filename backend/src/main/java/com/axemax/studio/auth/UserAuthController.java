package com.axemax.studio.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth/user")
public class UserAuthController {
    private final UserAuthService service;
    public UserAuthController(UserAuthService service) { this.service = service; }

    @PostMapping("/register")
    public UserAuthService.RegistrationResult register(@Valid @RequestBody RegisterRequest request) {
        return service.register(new UserAuthService.RegisterRequest(
            request.username(), request.email(), request.phoneNumber(), request.password()));
    }

    @GetMapping("/verify-email")
    public UserAuthService.VerificationResult verifyEmail(@RequestParam String token) {
        return service.verifyEmail(token);
    }

    @PostMapping("/verify-phone")
    public UserAuthService.VerificationResult verifyPhone(@Valid @RequestBody PhoneVerificationRequest request) {
        return service.verifyPhone(new UserAuthService.PhoneVerificationRequest(request.identifier(), request.code()));
    }

    @PostMapping("/login")
    public UserAuthService.TokenResponse login(@Valid @RequestBody LoginRequest request) {
        return service.login(new UserAuthService.LoginRequest(request.identifier(), request.password()));
    }

    public record RegisterRequest(
        @NotBlank @Size(min=3, max=40) @Pattern(regexp="[A-Za-z0-9_.-]+", message="Use letters, numbers, dot, underscore or hyphen for username")
        String username,
        @NotBlank @Email @Size(max=255) String email,
        @NotBlank @Pattern(regexp="^\\+[1-9][0-9]{7,14}$", message="Use phone number in international format, e.g. +919876543210")
        String phoneNumber,
        @NotBlank @Size(min=10, max=72, message="Password must contain 10 to 72 characters") String password) {}

    public record LoginRequest(@NotBlank String identifier, @NotBlank String password) {}
    public record PhoneVerificationRequest(@NotBlank String identifier, @NotBlank @Pattern(regexp="[0-9]{6}") String code) {}
}
