package com.cureai.controller;

import com.cureai.model.User;
import com.cureai.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174"})
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/signup
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> body) {
        try {
            String name     = (String) body.get("name");
            String email    = (String) body.get("email");
            String password = (String) body.get("password");
            String role     = (String) body.get("role");
            String gender   = (String) body.get("gender");
            Integer age     = body.get("age") != null
                              ? Integer.parseInt(body.get("age").toString()) : null;

            User user    = authService.signup(name, email, password, role, age, gender);
            String token = authService.generateToken(user);

            return ResponseEntity.ok(Map.of(
                "token",  token,
                "role",   user.getRole(),
                "userId", user.getId(),
                "name",   user.getName()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // POST /api/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String email    = body.get("email");
            String password = body.get("password");

            User user    = authService.login(email, password);
            String token = authService.generateToken(user);

            return ResponseEntity.ok(Map.of(
                "token",  token,
                "role",   user.getRole(),
                "userId", user.getId(),
                "name",   user.getName()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}