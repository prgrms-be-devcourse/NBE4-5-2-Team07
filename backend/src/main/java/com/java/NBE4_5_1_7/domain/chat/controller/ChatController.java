package com.java.NBE4_5_1_7.domain.chat.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.java.NBE4_5_1_7.domain.chat.model.Message;
import com.java.NBE4_5_1_7.domain.chat.service.ChatPublisher;
import com.java.NBE4_5_1_7.domain.chat.service.ChatService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatController {
	private final SimpMessagingTemplate messagingTemplate;
	private final ChatService chatService;
	private final ChatPublisher chatPublisher;

	/// 사용자가 메시지를 보낼 때
	@MessageMapping("/user/chat/{roomId}")
	public void sendUserMessage(@DestinationVariable Long roomId, String message) {
		chatService.saveMessage(roomId, "USER", message);
		chatPublisher.sendMessageToAdmin(roomId, message);

		messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
	}

	/// 관리자가 응답할 때
	@MessageMapping("/admin/chat/{roomId}")
	public void sendAdminMessage(@DestinationVariable Long roomId, String message) {
		chatService.saveMessage(roomId, "ADMIN", message);

		messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
	}

	/// 채팅방 메시지 조회
	@GetMapping("/chat/messages/{roomId}")
	public List<Message> getMessage(@PathVariable Long roomId) {
		return chatService.getMessage(roomId);
	}
}