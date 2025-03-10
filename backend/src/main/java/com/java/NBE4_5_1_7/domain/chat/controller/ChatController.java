package com.java.NBE4_5_1_7.domain.chat.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.java.NBE4_5_1_7.domain.chat.service.ChatPublisher;
import com.java.NBE4_5_1_7.domain.chat.service.ChatService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatController {
	private final ChatPublisher chatPublisher;  // Redis Pub/Sub 발행
	private final ChatService chatService;

	/// 메세지 저장
	@MessageMapping("/chat/{roomId}")
	@SendTo("/topic/chat/{roomId}")
	public void sendChatMessage(@DestinationVariable Long roomId, String message) {
		chatService.saveMessage(roomId, message);
		chatPublisher.sendMessage(roomId, message);
	}

	/// 재입장 시 이전 메시지 불러오기
	@MessageMapping("/getMessages/{roomId}")
	@SendTo("/topic/chat/{roomId}")
	public List<String> getChatMessages(@DestinationVariable Long roomId) {
		return chatService.getMessages(roomId);
	}
}
