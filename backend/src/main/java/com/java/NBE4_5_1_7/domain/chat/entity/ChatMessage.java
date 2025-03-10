package com.java.NBE4_5_1_7.domain.chat.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class ChatMessage {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "room_id")
	@JsonIgnore
	private ChatRoom chatRoom;

	private String message;

	@CreatedDate
	@Column(updatable = false)
	private LocalDateTime sendAt;

	public ChatMessage(String message, ChatRoom chatRoom) {
		this.message = message;
		this.chatRoom = chatRoom;
		this.sendAt = LocalDateTime.now();
	}
}