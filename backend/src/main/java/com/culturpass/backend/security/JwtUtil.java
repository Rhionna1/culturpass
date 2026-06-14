package com.culturpass.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;

// Handles creating and validating JWT tokens
@Component
public class JwtUtil {

    // Secret key — in production this goes in environment variables
    @Value("${app.jwt.secret}")
    private String secret;
    private static final long EXPIRATION = 1000 * 60 * 60 * 24; // 24 hours

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Generate a JWT token for a user
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getKey())
                .compact();
    }

    // Extract the email from a token
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    // Extract the role from a token
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // Check if a token is still valid
    public boolean isTokenValid(String token) {
        try {
            return getClaims(token).getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // Parse the token and return all claims
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}