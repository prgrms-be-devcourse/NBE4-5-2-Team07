package com.java.NBE4_5_1_7.domain.chat.dto.response;

import java.util.List;

import com.java.NBE4_5_1_7.domain.chat.entity.ChatMessage;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ChatMessageResponseDto {
	private Long roomId;
	List<ChatMessage> chatMessages;
}
