package com.java.NBE4_5_1_7.domain.chat.service;

import com.java.NBE4_5_1_7.domain.chat.model.Message;
import com.java.NBE4_5_1_7.domain.mail.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final Map<Long, List<Message>> messageStorage = new HashMap<>();
    private final Map<Long, Long> messageTimestamp = new HashMap<>();
    private final RedisTemplate<String, Message> redisTemplate;
    private final EmailService emailService;

    /// 메시지 저장
    @Transactional
    public void saveMessage(Long roomId, String sender, String content, String timestamp) {
        Message message = new Message(roomId, sender, content, timestamp);
        redisTemplate.opsForList().rightPush("chat:" + roomId, message);
        emailService.sendChatNotification(sender, content, timestamp);
        String redisChannel = sender.equals("ADMIN") ? "admin:chat:" + roomId : "chat:" + roomId;
        redisTemplate.convertAndSend(redisChannel, message);

        // 확인 후 지우기
        System.out.println("✅ [saveMessage] 메시지 저장 및 Redis 전송 완료 - roomId: " + roomId + ", sender: " + sender);
    }

    /// 24시간이 지난 메시지 삭제
    @Scheduled(cron = "0 0 0/1 * * ?") // 1시간마다 체크
    public void deleteExpiredMessages() {
        long currentTime = System.currentTimeMillis();
        messageTimestamp.entrySet().removeIf(entry -> {
            long elapsed = currentTime - entry.getValue();
            if (elapsed >= 86400000) { // 24시간 (24 * 60 * 60 * 1000ms)
                messageStorage.remove(entry.getKey());
                return true;
            }
            return false;
        });
    }

    /// 메시지 조회
    @Transactional(readOnly = true)
    public List<Message> getMessage(Long roomId) {
        List<Message> messages = redisTemplate.opsForList().range("chat:" + roomId, 0, -1);

        // 🔍 Redis에서 가져온 데이터 확인 로그 추가
        System.out.println("🔍 [getMessage] 채팅 조회 - roomId: " + roomId);
        System.out.println("📢 [Redis] 조회된 메시지: " + messages);

        return messages;
    }

    /// 관리자가 모든 채팅 내역 조회 (Redis 기반으로 모든 채팅방의 메시지 조회)
    @Transactional(readOnly = true)
    public List<Message> getAllMessages() {
        Set<String> keys = redisTemplate.keys("chat:*");
        List<Message> allMessages = new ArrayList<>();
        for (String key : keys) {
            allMessages.addAll(Objects.requireNonNull(redisTemplate.opsForList().range(key, 0, -1)));
        }
        return allMessages;
    }

    /// 관리자가 특정 채팅방의 메시지 삭제
    @Transactional
    public void deleteChatRoomMessages(Long roomId) {
        redisTemplate.delete("chat:" + roomId);
    }
}