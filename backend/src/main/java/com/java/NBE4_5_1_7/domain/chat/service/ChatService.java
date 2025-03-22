package com.java.NBE4_5_1_7.domain.chat.service;

import com.java.NBE4_5_1_7.domain.chat.model.ChatRoom;
import com.java.NBE4_5_1_7.domain.chat.model.Message;
import com.java.NBE4_5_1_7.domain.mail.EmailService;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.global.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final RedisTemplate<String, Message> redisTemplate;
    private final EmailService emailService;
    private final MemberService memberService;
    private final Rq rq;

    /// 메시지 저장
    @Transactional
    public void saveMessage(Long roomId, String sender, String content, String timestamp) {
        Message message = new Message(roomId, sender, content, timestamp);
        redisTemplate.opsForList().rightPush("chat:" + roomId, message);

        emailService.sendChatNotification(sender, content, timestamp);

        String redisChannel = sender.equals("ADMIN") ? "admin:chat:" + roomId : "chat:" + roomId;
        redisTemplate.convertAndSend(redisChannel, message);

        System.out.println("✅ [saveMessage] 메시지 저장 및 Redis 전송 완료 - roomId: " + roomId + ", sender: " + sender);
    }

    /// 채팅 내역 조회
    @Transactional(readOnly = true)
    public List<Message> getMessage(Long roomId) {
        List<Message> messages = redisTemplate.opsForList().range("chat:" + roomId, 0, -1);
        return messages != null ? messages : Collections.emptyList();
    }

    /// 전체 채팅 내역 조회
    @Transactional(readOnly = true)
    public List<Message> getAllMessages() {
        Set<String> keys = redisTemplate.keys("chat:*");
        List<Message> allMessages = new ArrayList<>();
        for (String key : keys) {
            allMessages.addAll(Objects.requireNonNull(redisTemplate.opsForList().range(key, 0, -1)));
        }
        return allMessages;
    }

    /// 채팅방 삭제
    @Transactional
    public void deleteChatRoomMessages(Long roomId) {
        redisTemplate.delete("chat:" + roomId);
        System.out.println("🗑️ 채팅방 삭제 완료 - roomId=" + roomId);
    }

    ///  채팅방 목록 조회
    @Transactional(readOnly = true)
    public List<Long> getChatRooms() {
        Set<String> keys = redisTemplate.keys("chat:*");
        return keys.stream()
                .map(key -> Long.parseLong(key.replace("chat:", "")))
                .collect(Collectors.toList());
    }

    /// 30분 이상 메시지 없는 게스트 채팅방 자동 삭제
    @Scheduled(cron = "0 0 * * * *")
    public void checkAndDeleteOldGuestRooms() {
        LocalDateTime now = LocalDateTime.now();
        List<Long> allRooms = getChatRooms();

        // GUEST 채팅만 자동 제거
        for (Long roomId : allRooms) {
            if (roomId >= 0) continue;

            List<Message> messages = getMessage(roomId);
            if (!messages.isEmpty()) {
                Message lastMessage = messages.get(messages.size() - 1);
                try {
                    Instant instant = Instant.parse(lastMessage.getTimestamp());
                    LocalDateTime lastMessageTime = instant.atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime();

                    if (Duration.between(lastMessageTime, now).toMinutes() >= 30) {
                        deleteChatRoomMessages(roomId);
                        System.out.println("⏰ 자동 삭제된 게스트 채팅방 - roomId=" + roomId);
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ 타임스탬프 파싱 실패 - roomId=" + roomId + ", timestamp=" + lastMessage.getTimestamp());
                    e.printStackTrace();
                }
            }
        }
    }

    /// 현재 사용자 정보 반환 ( ADMIN / USER / GUEST)
    @Transactional(readOnly = true)
    public ChatRoom getChatRoomInfo() {
        try {
            Member actor = rq.getActor();
            Member realActor = rq.getRealActor(actor);

            boolean isAdmin = memberService.isAdmin(realActor.getId());
            if (isAdmin) {
                return new ChatRoom(null, null, "ADMIN");
            }

            Long roomId = realActor.getId();
            String nickname = realActor.getNickname();
            return new ChatRoom(roomId, nickname, "USER");
        } catch (Exception e) {
            long guestId = generateUniqueGuestId();
            return new ChatRoom(guestId, "게스트 " + (-guestId), "GUEST");
        }
    }

    private long generateUniqueGuestId() {
        Set<String> keys = redisTemplate.keys("chat:*");
        Set<Long> usedGuestIds = keys.stream()
                .map(key -> {
                    try {
                        return Long.parseLong(key.replace("chat:", ""));
                    } catch (NumberFormatException e) {
                        return 0L;
                    }
                })
                .filter(id -> id < 0)
                .collect(Collectors.toSet());

        long candidate = -1;
        while (usedGuestIds.contains(candidate)) {
            candidate--;
        }
        return candidate;
    }
}