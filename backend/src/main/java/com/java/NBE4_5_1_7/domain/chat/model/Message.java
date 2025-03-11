package com.java.NBE4_5_1_7.domain.chat.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Message {
	private Long roomId;
	private String sender;   // 발신자 (시스템/사용자/관리자)
	private String content;
	private LocalDateTime timestamp;
}