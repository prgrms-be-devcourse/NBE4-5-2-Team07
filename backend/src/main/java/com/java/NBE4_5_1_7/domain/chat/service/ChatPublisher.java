package com.java.NBE4_5_1_7.domain.chat.service;

import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/// 관리자가 메세지를 받는 로직
@Service
public class ChatPublisher {
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisTemplate<String, String> redisTemplate;

    public ChatPublisher(SimpMessagingTemplate messagingTemplate, @Lazy RedisTemplate<String, String> redisTemplate) {
        this.messagingTemplate = messagingTemplate;
        this.redisTemplate = redisTemplate;
    }

    /// 메시지를 관리자가 받도록 전달하고, 24시간 뒤 삭제 설정
    public void sendMessageToAdmin(Long roomId, String message) {
        System.out.println("✅ [ChatPublisher] 관리자 메시지 발행 - 채널: admin:chat:" + roomId + " | 메시지: " + message);
        redisTemplate.convertAndSend("admin:chat:" + roomId, message);
    }

    /// Redis에서 수신된 관리자 메시지를 WebSocket을 통해 유저에게 전송
    public void receiveAdminMessage(String message, String channel) {
        String[] parts = channel.split(":");
        String roomId = parts.length > 2 ? parts[2] : parts[1]; // 배열 길이 확인하여 안전하게 처리
        System.out.println("✅ [ChatPublisher] Redis 메시지 수신 - 채널: " + channel + " | roomId: " + roomId + " | 메시지: " + message);
        messagingTemplate.convertAndSend("/topic/admin/chat/" + roomId, message);
    }
}