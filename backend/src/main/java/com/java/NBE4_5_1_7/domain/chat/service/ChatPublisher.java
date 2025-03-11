package com.java.NBE4_5_1_7.domain.chat.service;

import java.time.LocalDateTime;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/// 관리자가 메세지를 받는 로직
@Service
public class ChatPublisher {
	private final SimpMessagingTemplate messagingTemplate;
	private final ChatService chatService;

	public ChatPublisher(SimpMessagingTemplate messagingTemplate, ChatService chatService) {
		this.messagingTemplate = messagingTemplate;
		this.chatService = chatService;
	}

	/// 메시지를 관리자가 받도록 전달하고, 24시간 뒤 삭제 설정
	public void sendMessageToAdmin(Long roomId, String message, LocalDateTime timestamp) {
		chatService.saveMessage(roomId, "ADMIN", message, timestamp);
		messagingTemplate.convertAndSend("/topic/admin/chat/" + roomId, message);
	}
}