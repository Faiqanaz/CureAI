package com.cureai.service;

import com.cureai.model.*;
import com.cureai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository sessionRepo;
    private final ChatMessageRepository messageRepo;
    private final MedicalHistoryRepository medHistoryRepo;
    private final UserRepository userRepo;

    public ChatSession createSession(Long userId, String title) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        ChatSession session = new ChatSession();
        session.setUser(user);
        session.setTitle(title != null ? title : "New conversation");
        return sessionRepo.save(session);
    }

    public ChatMessage saveMessage(Long sessionId, String role, String content) {
        ChatSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        ChatMessage msg = new ChatMessage();
        msg.setSession(session);
        msg.setRole(role);
        msg.setContent(content);
        return messageRepo.save(msg);
    }

    public List<ChatMessage> getSessionMessages(Long sessionId) {
        return messageRepo.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    public List<ChatSession> getUserSessions(Long userId) {
        return sessionRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public MedicalHistory saveMedicalHistory(Long userId, Long sessionId,
                                              String symptoms, String diagnosis,
                                              String recommendations, String severity) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        MedicalHistory h = new MedicalHistory();
        h.setUser(user);
        h.setSessionId(sessionId);
        h.setSymptoms(symptoms);
        h.setDiagnosis(diagnosis);
        h.setRecommendations(recommendations);
        h.setSeverity(severity);
        return medHistoryRepo.save(h);
    }

    public List<MedicalHistory> getMedicalHistory(Long userId) {
        return medHistoryRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }
}