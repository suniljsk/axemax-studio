package com.axemax.studio.auth;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class UserAuthService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int MAX_OTP_ATTEMPTS = 5;

    private final UserAccountRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AccountNotificationService notifications;
    private final String adminEmail;

    public UserAuthService(UserAccountRepository users, PasswordEncoder passwordEncoder,
        JwtService jwtService, AccountNotificationService notifications,
        @Value("${app.admin.email}") String adminEmail) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.notifications = notifications;
        this.adminEmail = adminEmail.toLowerCase(Locale.ROOT);
    }

    @Transactional
    public RegistrationResult register(RegisterRequest request) {
        if (request.confirmPassword() == null || !request.password().equals(request.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match.");
        }
        String username = request.username().trim().toLowerCase(Locale.ROOT);
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String phone = request.phoneNumber().trim();

        if (email.equals(adminEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This email cannot be used for a user account.");
        }
        if (users.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already in use.");
        }
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered.");
        }
        if (users.existsByPhoneNumber(phone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number is already registered.");
        }

        UserAccount user = new UserAccount(username, email, phone, passwordEncoder.encode(request.password()));
        String emailToken = randomToken();
        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        user.setEmailVerification(sha256(emailToken), Instant.now().plus(24, ChronoUnit.HOURS));
        user.setPhoneOtp(sha256(otp), Instant.now().plus(10, ChronoUnit.MINUTES));
        users.saveAndFlush(user);

        // Both messages are sent only to the address and phone number the registrant supplied.
        notifications.sendEmailVerification(email, username, emailToken);
        notifications.sendPhoneOtp(phone, otp);
        return new RegistrationResult(username, email, true, true,
            "Account created. Confirm the email link and enter the SMS code before signing in.");
    }

    @Transactional
    public VerificationResult verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token is required.");
        }
        UserAccount user = users.findByEmailVerificationTokenHash(sha256(token))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification link is invalid or expired."));
        if (user.getEmailVerificationExpiresAt() == null || user.getEmailVerificationExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification link is invalid or expired.");
        }
        user.markEmailVerified();
        users.saveAndFlush(user);
        maybeSendWelcomeEmail(user);
        users.saveAndFlush(user);
        return new VerificationResult(user.isEmailVerified(), user.isPhoneVerified(),
            user.isFullyVerified(), user.getUsername(),
            user.isFullyVerified() ? "Email and phone are verified. You can sign in." : "Email confirmed. Please verify your phone to finish.");
    }

    public VerificationResult verifyPhone(PhoneVerificationRequest request) {
        String identifier = request.identifier().trim();
        UserAccount user = users.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account or code is invalid."));
        if (user.isPhoneVerified()) {
            return new VerificationResult(user.isEmailVerified(), true, user.isFullyVerified(), user.getUsername(), "Phone number is already verified.");
        }
        if (user.getPhoneOtpExpiresAt() == null || user.getPhoneOtpExpiresAt().isBefore(Instant.now())
            || user.getPhoneOtpAttempts() >= MAX_OTP_ATTEMPTS || user.getPhoneOtpHash() == null
            || !constantTimeEquals(user.getPhoneOtpHash(), sha256(request.code()))) {
            user.incrementPhoneOtpAttempts();
            users.saveAndFlush(user);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code is invalid or expired.");
        }
        user.markPhoneVerified();
        users.saveAndFlush(user);
        maybeSendWelcomeEmail(user);
        users.saveAndFlush(user);
        return new VerificationResult(user.isEmailVerified(), true, user.isFullyVerified(), user.getUsername(),
            user.isFullyVerified() ? "Phone verified. Your account is ready." : "Phone confirmed. Please confirm your email to finish.");
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        String identifier = request.identifier().trim();
        UserAccount user = users.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username/email or password."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username/email or password.");
        }
        if (!user.isFullyVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Confirm your email and phone number before signing in.");
        }
        return new TokenResponse(jwtService.createToken(user.getEmail(), "USER"), "Bearer", 1800, user.getUsername(), "USER");
    }

    private void maybeSendWelcomeEmail(UserAccount user) {
        if (user.isFullyVerified() && !user.isWelcomeEmailSent()) {
            notifications.sendWelcomeEmail(user.getEmail(), user.getUsername());
            user.markWelcomeEmailSent();
        }
    }

    private static String randomToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }

    private static boolean constantTimeEquals(String expected, String actual) {
        return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), actual.getBytes(StandardCharsets.UTF_8));
    }

    public record RegisterRequest(String username, String email, String phoneNumber, String password, String confirmPassword) {}
    public record LoginRequest(String identifier, String password) {}
    public record PhoneVerificationRequest(String identifier, String code) {}
    public record RegistrationResult(String username, String email, boolean emailVerificationSent, boolean phoneVerificationSent, String message) {}
    public record VerificationResult(boolean emailVerified, boolean phoneVerified, boolean accountVerified, String username, String message) {}
    public record TokenResponse(String accessToken, String tokenType, long expiresInSeconds, String username, String role) {}
}
