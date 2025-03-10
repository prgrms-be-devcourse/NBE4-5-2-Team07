package com.java.NBE4_5_1_7.domain.chat.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/// 메시지 구독
@Service
public class ChatSubscriber {
	private final SimpMessagingTemplate messagingTemplate;

	public ChatSubscriber(SimpMessagingTemplate messagingTemplate) {
		this.messagingTemplate = messagingTemplate;
	}

	public void receiveMessage(String message, String channel) {
		String roomId = channel.split(":")[1];
		messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
	}
}