package com.java.NBE4_5_1_7.domain.chat.controller;

import com.java.NBE4_5_1_7.domain.chat.model.Message;
import com.java.NBE4_5_1_7.domain.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    /// 유저 메시지 전송
    @MessageMapping("/chat/user/{roomId}")
    public void sendUserMessage(@DestinationVariable Long roomId, Message message) {
        System.out.println("STOMP 메시지를 받았습니다: " + message);
        chatService.saveMessage(roomId, message.getSender(), message.getContent(), message.getTimestamp());
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
    }

    /// 관리자 메시지 전송
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @MessageMapping("/chat/admin/{roomId}")
    public void sendAdminMessage(@DestinationVariable Long roomId, Message message) {
        chatService.saveMessage(roomId, message.getSender(), message.getContent(), message.getTimestamp());
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
    }

    /// 시스템 메시지 전송
    @MessageMapping("/chat/system/{roomId}")
    public void sendSystemMessage(@DestinationVariable Long roomId, Message message) {
        chatService.saveMessage(roomId, "SYSTEM", message.getContent(), message.getTimestamp());
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
    }

    @GetMapping("/chat/messages/all")
    public List<Message> getAllMessages() {
        return chatService.getAllMessages();
    }

    @GetMapping("/chat/messages/{roomId}")
    public List<Message> getMessage(@PathVariable Long roomId) {
        return chatService.getMessage(roomId);
    }

//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/chat/messages/{roomId}")
    public void deleteChatRoomMessages(@PathVariable Long roomId) {
        chatService.deleteChatRoomMessages(roomId);
    }
}