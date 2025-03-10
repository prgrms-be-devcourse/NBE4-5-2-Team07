package com.java.NBE4_5_1_7.domain.chat.service;

import org.redisson.api.RedissonClient;
import org.redisson.api.RTopic;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

/// Redis에서 메시지 구독
@Service
@RequiredArgsConstructor
public class ChatSubscriber {
	private final RedissonClient redissonClient;
	private final SimpMessagingTemplate messagingTemplate;

	@PostConstruct
	public void subscribe() {
		RTopic topic = redissonClient.getTopic("chatroom-*");
		topic.addListener(String.class, (channel, message) -> {
			Long roomId = Long.parseLong(channel.subSequence("chatroom-".length(), channel.length()).toString());
			messagingTemplate.convertAndSend("/sub/chat/room/" + roomId, message);
		});
	}
}