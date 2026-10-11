package com.axemax.studio.auth;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_accounts")
public class UserAccount {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String username;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(name = "phone_number", nullable = false, length = 24)
    private String phoneNumber;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String role = "USER";

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;

    @Column(name = "phone_verified", nullable = false)
    private boolean phoneVerified;

    @Column(name = "email_verification_token_hash", length = 64)
    private String emailVerificationTokenHash;

    @Column(name = "email_verification_expires_at")
    private Instant emailVerificationExpiresAt;

    @Column(name = "phone_otp_hash", length = 64)
    private String phoneOtpHash;

    @Column(name = "phone_otp_expires_at")
    private Instant phoneOtpExpiresAt;

    @Column(name = "phone_otp_attempts", nullable = false)
    private int phoneOtpAttempts;

    @Column(name = "welcome_email_sent", nullable = false)
    private boolean welcomeEmailSent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected UserAccount() {}

    public UserAccount(String username, String email, String phoneNumber, String passwordHash) {
        this.username = username;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.passwordHash = passwordHash;
        this.role = "USER";
    }

    @PrePersist void onCreate() { createdAt = Instant.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getPasswordHash() { return passwordHash; }
    public String getRole() { return role; }
    public boolean isEmailVerified() { return emailVerified; }
    public boolean isPhoneVerified() { return phoneVerified; }
    public boolean isFullyVerified() { return emailVerified && phoneVerified; }
    public String getEmailVerificationTokenHash() { return emailVerificationTokenHash; }
    public Instant getEmailVerificationExpiresAt() { return emailVerificationExpiresAt; }
    public String getPhoneOtpHash() { return phoneOtpHash; }
    public Instant getPhoneOtpExpiresAt() { return phoneOtpExpiresAt; }
    public int getPhoneOtpAttempts() { return phoneOtpAttempts; }
    public boolean isWelcomeEmailSent() { return welcomeEmailSent; }

    public void setEmailVerification(String hash, Instant expiresAt) {
        this.emailVerificationTokenHash = hash; this.emailVerificationExpiresAt = expiresAt;
    }
    public void markEmailVerified() {
        this.emailVerified = true; this.emailVerificationTokenHash = null; this.emailVerificationExpiresAt = null;
    }
    public void setPhoneOtp(String hash, Instant expiresAt) {
        this.phoneOtpHash = hash; this.phoneOtpExpiresAt = expiresAt; this.phoneOtpAttempts = 0;
    }
    public void incrementPhoneOtpAttempts() { this.phoneOtpAttempts++; }
    public void markPhoneVerified() {
        this.phoneVerified = true; this.phoneOtpHash = null; this.phoneOtpExpiresAt = null; this.phoneOtpAttempts = 0;
    }
    public void markWelcomeEmailSent() { this.welcomeEmailSent = true; }
}
