package com.java.NBE4_5_1_7.domain.chat.service;

import java.util.List;
import java.util.stream.Collectors;

import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import com.java.NBE4_5_1_7.domain.chat.dto.request.ChatRoomRequestDto;
import com.java.NBE4_5_1_7.domain.chat.dto.response.ChatMessageResponseDto;
import com.java.NBE4_5_1_7.domain.chat.dto.response.ChatRoomResponseDto;
import com.java.NBE4_5_1_7.domain.chat.entity.ChatMessage;
import com.java.NBE4_5_1_7.domain.chat.entity.ChatRoom;
import com.java.NBE4_5_1_7.domain.chat.repository.ChatMessageRepository;
import com.java.NBE4_5_1_7.domain.chat.repository.ChatRoomRepository;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.global.exception.ServiceException;
import com.java.NBE4_5_1_7.global.util.LockManager;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
	private final ChatRoomRepository chatRoomRepository;
	private final ChatMessageRepository chatMessageRepository;
	private final RedissonClient redissonClient;

	@Transactional
	public ChatRoomResponseDto createChatRoom(ChatRoomRequestDto requestDto, Member member) {
		LockManager lockManager = new LockManager(redissonClient);

		RLock lock = lockManager.getLock("lock:chatroom:" + requestDto.getRoomId());

		try {
			lockManager.acquireLock(lock, 5, 10);

			ChatRoom chatRoom = new ChatRoom();
			chatRoom.setMember(member);
			ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);

			ChatMessage firstMessage = new ChatMessage(requestDto.getMessage(), savedChatRoom);
			chatMessageRepository.save(firstMessage);

			return new ChatRoomResponseDto(savedChatRoom.getId());
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new RuntimeException("락 획득 중 인터럽트가 발생했습니다.", e);
		} finally {
			lockManager.releaseLock(lock);
		}
	}

	public List<ChatRoomResponseDto> getAllChatRooms(Member member) {
		List<ChatRoom> chatRooms = chatRoomRepository.findByMember(member);

		return chatRooms.stream()
			.map(chatRoom -> new ChatRoomResponseDto(chatRoom.getId()))
			.collect(Collectors.toList());
	}

	public ChatMessageResponseDto getChatRoom(Long roomId, Member member) {
		ChatRoom chatRoom = chatRoomRepository.findById(roomId)
			.orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

		if (!chatRoom.getMember().equals(member)) {
			throw new RuntimeException("사용자가 이 채팅방에 참여하고 있지 않습니다.");
		}

		List<ChatMessage> chatMessages = chatMessageRepository.findByChatRoomId(roomId);

		System.out.println("123:: " + chatMessages.size());

		return new ChatMessageResponseDto(chatRoom.getId(), chatMessages);
	}

	public void deleteChatRoom(Long roomId, Member member) {
		ChatRoom chatRoom = chatRoomRepository.findById(roomId)
			.orElseThrow(() -> new ServiceException("404", "채팅방을 찾을 수 없습니다."));

		if (!chatRoom.getMember().equals(member)) {
			throw new ServiceException("403", "본인이 참여한 채팅방만 삭제할 수 있습니다.");
		}

		List<ChatMessage> chatMessages = chatMessageRepository.findByChatRoomId(chatRoom.getId());
		chatMessageRepository.deleteAll(chatMessages);

		chatRoomRepository.deleteById(roomId);
	}
}
