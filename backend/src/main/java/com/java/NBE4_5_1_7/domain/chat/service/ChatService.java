package com.java.NBE4_5_1_7.domain.chat.service;

import java.time.Duration;
import java.util.List;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {
	private final RedisTemplate<String, String> redisTemplate;

	public void saveMessage(Long roomId, String message) {
		String key = "chat:room:" + roomId;
		redisTemplate.opsForList().rightPush(key, message);
		redisTemplate.expire(key, Duration.ofMinutes(10)); // 10분 후 자동 삭제
	}

	public List<String> getMessages(Long roomId) {
		String key = "chat:room:" + roomId;
		return redisTemplate.opsForList().range(key, 0, -1);
	}
}