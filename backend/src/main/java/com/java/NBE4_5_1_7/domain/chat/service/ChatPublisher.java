package com.java.NBE4_5_1_7.domain.chat.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/// 메시지 발행
@Service
public class ChatPublisher {

	private final SimpMessagingTemplate messagingTemplate;

	public ChatPublisher(SimpMessagingTemplate messagingTemplate) {
		this.messagingTemplate = messagingTemplate;
	}

	public void sendMessage(Long roomId, String message) {
		messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
	}
}