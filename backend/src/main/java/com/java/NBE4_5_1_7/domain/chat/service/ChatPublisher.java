package com.java.NBE4_5_1_7.domain.chat.service;

import org.redisson.api.RTopic;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/// 메시지를 Redis에 발행
@Service
@RequiredArgsConstructor
public class ChatPublisher {
	private final RedissonClient redissonClient;

	public void sendMessage(Long roomId, Long senderId, String message) {
		RTopic topic = redissonClient.getTopic("chatroom-" + roomId);
		topic.publish(senderId + ": " + message);
	}
}