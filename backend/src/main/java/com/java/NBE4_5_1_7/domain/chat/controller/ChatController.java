package com.java.NBE4_5_1_7.domain.chat.controller;

import com.java.NBE4_5_1_7.domain.chat.model.ChatRoom;
import com.java.NBE4_5_1_7.domain.chat.model.Message;
import com.java.NBE4_5_1_7.domain.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    /// 채팅방 정보 조회
    @GetMapping("/chat/room/info")
    public ResponseEntity<ChatRoom> getChatRoomInfo() {
        try {
            ChatRoom info = chatService.getChatRoomInfo();
            return ResponseEntity.ok(info);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).build();
        }
    }

    /// 유저 or 게스트 메시지 전송
    @MessageMapping("/chat/user/{roomId}")
    public void sendUserMessage(@DestinationVariable Long roomId, Message message) {
        chatService.saveMessage(roomId, message.getSender(), message.getContent(), message.getTimestamp());
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
    }

    /// 관리자 메시지 전송
    //  @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @MessageMapping("/chat/admin/{roomId}")
    public void sendAdminMessage(@DestinationVariable Long roomId, Message message) {
        chatService.saveMessage(roomId, "ADMIN", message.getContent(), message.getTimestamp());
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
    }

    /// 시스템 메시지 전송
    @MessageMapping("/chat/system/{roomId}")
    public void sendSystemMessage(@DestinationVariable Long roomId, Message message) {
        chatService.saveMessage(roomId, "SYSTEM", message.getContent(), message.getTimestamp());
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
    }

    /// 모든 메시지 조회 (관리자)
    @GetMapping("/chat/messages/all")
    public List<Message> getAllMessages() {
        return chatService.getAllMessages();
    }

    ///  메시지 조회
    @GetMapping("/chat/messages/{roomId}")
    public List<Message> getMessage(@PathVariable Long roomId) {
        return chatService.getMessage(roomId);
    }

    /// 채팅방 목록 조회 (관리자)
    // @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/chat/rooms")
    public List<Long> getChatRooms() {
        return chatService.getChatRooms();
    }

    /// 채팅방 삭제
    // @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/chat/messages/{roomId}")
    public void deleteChatRoomMessages(@PathVariable Long roomId) {
        chatService.deleteChatRoomMessages(roomId);
    }
}