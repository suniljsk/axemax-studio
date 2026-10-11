package com.axemax.studio.auth;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class AccountNotificationService {
    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String publicBaseUrl;
    private final String twilioAccountSid;
    private final String twilioAuthToken;
    private final String twilioFromNumber;
    private final AtomicBoolean twilioInitialized = new AtomicBoolean(false);

    public AccountNotificationService(JavaMailSender mailSender,
        @Value("${app.mail.from}") String fromEmail,
        @Value("${app.public-base-url}") String publicBaseUrl,
        @Value("${app.sms.twilio.account-sid:}") String twilioAccountSid,
        @Value("${app.sms.twilio.auth-token:}") String twilioAuthToken,
        @Value("${app.sms.twilio.from-number:}") String twilioFromNumber) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
        this.twilioAccountSid = twilioAccountSid;
        this.twilioAuthToken = twilioAuthToken;
        this.twilioFromNumber = twilioFromNumber;
    }

    public void sendEmailVerification(String email, String username, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("Confirm your AxeMax Studio email");
        message.setText("Hi " + username + ",\n\n"
            + "Thanks for joining AxeMax Studio. Confirm your email using this link (valid for 24 hours):\n"
            + publicBaseUrl + "/verify-email?token=" + token + "\n\n"
            + "If you did not create this account, you can ignore this email.");
        mailSender.send(message);
    }

    public void sendWelcomeEmail(String email, String username) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("Welcome to AxeMax Studio!");
        message.setText("Hi " + username + ",\n\n"
            + "Welcome to AxeMax Studio! Your email and phone number are confirmed, and your account is ready. "
            + "You can now sign in and start creating your portfolio.\n\n"
            + "We're glad you're here.\nThe AxeMax Studio team");
        mailSender.send(message);
    }

    public void sendPhoneOtp(String phoneNumber, String otp) {
        if (twilioAccountSid.isBlank() || twilioAuthToken.isBlank() || twilioFromNumber.isBlank()) {
            throw new IllegalStateException("SMS verification is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER.");
        }
        if (twilioInitialized.compareAndSet(false, true)) {
            Twilio.init(twilioAccountSid, twilioAuthToken);
        }
        Message.creator(new PhoneNumber(phoneNumber), new PhoneNumber(twilioFromNumber),
            "Your AxeMax Studio verification code is " + otp + ". It expires in 10 minutes. Do not share this code.")
            .create();
    }
}
