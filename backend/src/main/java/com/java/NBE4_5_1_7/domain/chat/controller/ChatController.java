package com.java.NBE4_5_1_7.domain.chat.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.java.NBE4_5_1_7.domain.chat.model.Message;
import com.java.NBE4_5_1_7.domain.chat.service.ChatService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ChatController {
	private final SimpMessagingTemplate messagingTemplate;
	private final ChatService chatService;

	/// 사용자가 메시지를 보낼 때
	@MessageMapping("/chat/user/{roomId}")
	public void sendUserMessage(@DestinationVariable Long roomId, Message message) {
		chatService.saveMessage(roomId, message.getSender(), message.getContent(), message.getTimestamp());

		messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
	}

	/// 관리자가 응답할 때
	@MessageMapping("/chat/admin/{roomId}")
	public void sendAdminMessage(@DestinationVariable Long roomId, Message message) {
		chatService.saveMessage(roomId, message.getSender(), message.getContent(), message.getTimestamp());

		messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
	}

	/// 시스템 메시지 처리
	@MessageMapping("/chat/system/{roomId}")
	public void sendSystemMessage(@DestinationVariable Long roomId, Message message) {
		System.out.println("📩 시스템 메시지 수신됨! Room ID: " + roomId + ", Message: " + message);

		chatService.saveMessage(roomId, message.getSender(), message.getContent(), message.getTimestamp());

		messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
	}

	/// 채팅방 메시지 조회
	@GetMapping("/chat/messages/{roomId}")
	public List<Message> getMessage(@PathVariable Long roomId) {
		return chatService.getMessage(roomId);
	}
}