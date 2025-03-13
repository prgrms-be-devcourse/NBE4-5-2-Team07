package com.java.NBE4_5_1_7.domain.chat.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/// 사용자가 관리자에게 메시지를 보내는 로직 및 관리자 메시지 처리
@Service
public class ChatSubscriber {
    private final SimpMessagingTemplate messagingTemplate;

    public ChatSubscriber(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void receiveMessage(String message, String channel) {
        String roomId = channel.split(":")[1];
        System.out.println("✅ [ChatSubscriber] 유저 메시지 수신 - 채널: " + channel + " | 메시지: " + message);
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
    }

    public void receiveAdminMessage(String message, String channel) {
        String[] parts = channel.split(":");
        String roomId = parts.length > 2 ? parts[2] : parts[1]; // 배열 길이 체크 후 안전하게 roomId 가져오기
        System.out.println("✅ [ChatSubscriber] 관리자 메시지 수신 - 채널: " + channel + " | roomId: " + roomId + " | 메시지: " + message);
        messagingTemplate.convertAndSend("/topic/admin/chat/" + roomId, message);
    }
}
