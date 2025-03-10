package com.java.NBE4_5_1_7.domain.chat.controller;

import java.time.LocalDateTime;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import com.java.NBE4_5_1_7.domain.chat.entity.ChatMessage;
import com.java.NBE4_5_1_7.domain.chat.entity.ChatRoom;
import com.java.NBE4_5_1_7.domain.chat.repository.ChatMessageRepository;
import com.java.NBE4_5_1_7.domain.chat.repository.ChatRoomRepository;
import com.java.NBE4_5_1_7.domain.chat.service.ChatPublisher;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatMessageController {
	private final ChatPublisher chatPublisher;
	private final ChatRoomRepository chatRoomRepository;
	private final ChatMessageRepository chatMessageRepository;

	@MessageMapping("/chat/{roomId}")
	public void sendChatMessage(Long roomId, Long senderId, String message) {
		ChatRoom chatRoom = chatRoomRepository.findById(roomId)
			.orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

		ChatMessage chatMessage = new ChatMessage();
		chatMessage.setChatRoom(chatRoom);
		chatMessage.setMessage(message);
		chatMessage.setSendAt(LocalDateTime.now());
		chatMessageRepository.save(chatMessage);

		chatPublisher.sendMessage(roomId, senderId, message);
	}
}
