package com.java.NBE4_5_1_7.domain.chat.model;

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
	private String sender;   // ( ADMIN / USER / GUEST / SYSTEM )
	private String content;
	private String timestamp;
}