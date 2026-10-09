package com.stitchai.api;

import com.stitchai.api.ApiModels.LoginRequest;
import com.stitchai.api.ApiModels.RegisterRequest;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(JdbcTemplate jdbc, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at most 72 UTF-8 bytes.");
        }
        if (jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE email = ?", Integer.class, email) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with that email already exists.");
        }
        jdbc.update("INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
                UUID.randomUUID().toString(), request.name().trim(), email, passwordEncoder.encode(request.password()));
        return session(email, request.name().trim());
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        String email = normalizeEmail(request.email());
        var users = jdbc.query("SELECT name, password_hash FROM users WHERE email = ?",
                (result, row) -> Map.of("name", result.getString("name"),
                        "password_hash", result.getString("password_hash")), email);
        if (users.isEmpty() || !passwordEncoder.matches(request.password(), users.getFirst().get("password_hash"))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect.");
        }
        return session(email, users.getFirst().get("name"));
    }

    private Map<String, Object> session(String email, String name) {
        return Map.of("token", jwtService.issue(email), "email", email, "name", name);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
