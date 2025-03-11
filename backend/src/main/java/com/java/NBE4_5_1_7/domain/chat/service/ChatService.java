package com.java.NBE4_5_1_7.domain.chat.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.java.NBE4_5_1_7.domain.chat.model.Message;

@Service
public class ChatService {

	private final Map<Long, List<Message>> messageStorage = new HashMap<>();
	private final Map<Long, Long> messageTimestamp = new HashMap<>();

	/// 메시지 저장
	public void saveMessage(Long roomId, String sender, String content, LocalDateTime timestamp) {
		Message message = new Message(roomId, sender, content, timestamp);

		messageStorage.putIfAbsent(roomId, new ArrayList<>());
		messageStorage.get(roomId).add(message);
		messageTimestamp.put(roomId, System.currentTimeMillis());

		System.out.println("메시지 저장 완료. 방 ID: " + roomId + ", 메시지: " + content);
		System.out.println("현재 메시지 목록: " + messageStorage.get(roomId));
	}

	/// 24시간이 지난 메시지 삭제
	@Scheduled(cron = "0 0 0/1 * * ?") // 1시간마다 체크
	public void deleteExpiredMessages() {
		long currentTime = System.currentTimeMillis();
		messageTimestamp.entrySet().removeIf(entry -> {
			long elapsed = currentTime - entry.getValue();
			if (elapsed >= 86400000) { // 24시간 (24 * 60 * 60 * 1000ms)
				messageStorage.remove(entry.getKey());
				return true;
			}
			return false;
		});
	}

	/// 메시지 조회
	public List<Message> getMessage(Long roomId) {
		List<Message> messages = messageStorage.getOrDefault(roomId, new ArrayList<>());
		return messages;
	}
}