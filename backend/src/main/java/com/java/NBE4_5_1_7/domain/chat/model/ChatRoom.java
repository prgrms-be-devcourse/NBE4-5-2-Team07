package com.java.NBE4_5_1_7.domain.chat.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDateTime;

@RedisHash("chatroom")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    @Id
    private Long roomId;
    private Long userIdentifier;
    private String userType;
    private LocalDateTime lastActivityTime;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
}