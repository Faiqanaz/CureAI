package com.cureai.controller;

import com.cureai.model.*;
import com.cureai.service.AuthService;
import com.cureai.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174"})
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final AuthService authService;

    private Long extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return authService.getUserIdFromToken(token);
    }

    // POST /api/chat/session — start new session
    @PostMapping("/session")
    public ResponseEntity<?> createSession(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody Map<String, String> body
    ) {
        Long userId = extractUserId(authHeader);
        ChatSession session = chatService.createSession(userId, body.get("title"));
        return ResponseEntity.ok(Map.of(
            "sessionId", session.getId(),
            "title",     session.getTitle(),
            "createdAt", session.getCreatedAt().toString()
        ));
    }

    // GET /api/chat/sessions — all sessions (sidebar history)
    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions(
        @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = extractUserId(authHeader);
        List<ChatSession> sessions = chatService.getUserSessions(userId);
        return ResponseEntity.ok(sessions.stream().map(s -> Map.of(
            "sessionId", s.getId(),
            "title",     s.getTitle(),
            "createdAt", s.getCreatedAt().toString()
        )).toList());
    }

    // POST /api/chat/message — save one message (user or assistant)
    @PostMapping("/message")
    public ResponseEntity<?> saveMessage(@RequestBody Map<String, Object> body) {
        Long sessionId = Long.parseLong(body.get("sessionId").toString());
        String role    = (String) body.get("role");
        String content = (String) body.get("content");

        ChatMessage msg = chatService.saveMessage(sessionId, role, content);
        return ResponseEntity.ok(Map.of("messageId", msg.getId()));
    }

    // GET /api/chat/history/{sessionId} — full message list for AI context
    @GetMapping("/history/{sessionId}")
    public ResponseEntity<?> getHistory(@PathVariable Long sessionId) {
        List<ChatMessage> messages = chatService.getSessionMessages(sessionId);
        return ResponseEntity.ok(messages.stream().map(m -> Map.of(
            "role",      m.getRole(),
            "content",   m.getContent(),
            "createdAt", m.getCreatedAt().toString()
        )).toList());
    }

    // POST /api/chat/medical-history — save AI diagnosis summary
    @PostMapping("/medical-history")
    public ResponseEntity<?> saveMedicalHistory(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody Map<String, Object> body
    ) {
        Long userId    = extractUserId(authHeader);
        Long sessionId = Long.parseLong(body.get("sessionId").toString());
        MedicalHistory history = chatService.saveMedicalHistory(
            userId, sessionId,
            (String) body.get("symptoms"),
            (String) body.get("diagnosis"),
            (String) body.get("recommendations"),
            (String) body.get("severity")
        );
        return ResponseEntity.ok(Map.of("historyId", history.getId()));
    }

    // GET /api/chat/medical-history — all records for the user
    @GetMapping("/medical-history")
    public ResponseEntity<?> getMedicalHistory(
        @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = extractUserId(authHeader);
        List<MedicalHistory> history = chatService.getMedicalHistory(userId);
        return ResponseEntity.ok(history.stream().map(h -> Map.of(
            "id",              h.getId(),
            "symptoms",        h.getSymptoms()        != null ? h.getSymptoms()        : "",
            "diagnosis",       h.getDiagnosis()       != null ? h.getDiagnosis()       : "",
            "recommendations", h.getRecommendations() != null ? h.getRecommendations() : "",
            "severity",        h.getSeverity()        != null ? h.getSeverity()        : "unknown",
            "sessionId",       h.getSessionId(),
            "createdAt",       h.getCreatedAt().toString()
        )).toList());
    }
}