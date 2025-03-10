package com.java.NBE4_5_1_7.domain.chat.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.java.NBE4_5_1_7.domain.chat.dto.request.ChatRoomRequestDto;
import com.java.NBE4_5_1_7.domain.chat.dto.response.ChatMessageResponseDto;
import com.java.NBE4_5_1_7.domain.chat.dto.response.ChatRoomResponseDto;
import com.java.NBE4_5_1_7.domain.chat.service.ChatRoomService;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/V1/chat")
public class ChatRoomController {
	private final ChatRoomService chatRoomService;
	private final MemberService memberService;

	/// 채팅방 생성
	@PostMapping
	public ResponseEntity<ChatRoomResponseDto> addChatRoom(@RequestBody ChatRoomRequestDto chatRoomRequestDto) {
		Member member = memberService.getMemberFromRq();

		ChatRoomResponseDto createdChatRoom = chatRoomService.createChatRoom(chatRoomRequestDto, member);
		return ResponseEntity.status(HttpStatus.CREATED).body(createdChatRoom);
	}

	/// 채팅방 목록 조회
	@GetMapping
	public ResponseEntity<List<ChatRoomResponseDto>> getAllChatRooms() {
		Member member = memberService.getMemberFromRq();

		List<ChatRoomResponseDto> chatRooms = chatRoomService.getAllChatRooms(member);
		return ResponseEntity.ok(chatRooms);
	}

	/// 채팅방 특정 조회
	@GetMapping("/{roomId}")
	public ResponseEntity<ChatMessageResponseDto> getChatRoom(@PathVariable Long roomId) {
		Member member = memberService.getMemberFromRq();

		ChatMessageResponseDto chatRoom = chatRoomService.getChatRoom(roomId, member);
		return ResponseEntity.ok(chatRoom);
	}

	/// 채팅방 삭제
	@DeleteMapping("/{roomId}")
	public ResponseEntity<String> deleteChatRoom(@PathVariable Long roomId) {
		Member member = memberService.getMemberFromRq();

		chatRoomService.deleteChatRoom(roomId, member);
		return ResponseEntity.ok("채팅방이 삭제되었습니다.");
	}
}
