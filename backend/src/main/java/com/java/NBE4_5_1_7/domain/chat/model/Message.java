package com.java.NBE4_5_1_7.domain.chat.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class Message {
	private String sender;   // 발신자 (사용자/관리자)
	private String content;  // 메시지 내용
}