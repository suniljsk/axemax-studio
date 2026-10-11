package com.axemax.studio.auth;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMinutes;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("JWT_SECRET must be at least 32 bytes.");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
    }

    public String createToken(String email) { return createToken(email, "ADMIN"); }

    public String createToken(String email, String role) {
        Instant now = Instant.now();
        return Jwts.builder().subject(email).claim("role", role)
            .issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(expirationMinutes * 60)))
            .signWith(key).compact();
    }

    public String extractSubject(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public String extractRole(String token) {
        String role = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().get("role", String.class);
        if (!"ADMIN".equals(role) && !"USER".equals(role)) throw new IllegalArgumentException("Invalid role claim");
        return role;
    }
}
