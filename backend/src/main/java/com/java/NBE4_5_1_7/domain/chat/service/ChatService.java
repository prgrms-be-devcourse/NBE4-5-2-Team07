package com.java.NBE4_5_1_7.domain.chat.service;

import com.java.NBE4_5_1_7.domain.chat.model.Message;
import com.java.NBE4_5_1_7.domain.mail.EmailService;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

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
    private final MemberRepository memberRepository;

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

    /// 회원 채팅룸 조회/생성 (회원 전용)
    /// 사용안하는 쪽으로 구성하기
//    @Transactional
//    public ChatRoom getOrCreateChatRoomForUser(Long userId) {
//        List<ChatRoom> all = new ArrayList<>();
//        chatRoomRepository.findAll().forEach(all::add);
//        Optional<ChatRoom> existing = all.stream()
//                .filter(Objects::nonNull)
//                .filter(room -> "USER".equals(room.getUserType()) &&
//                        room.getUserIdentifier() != null &&
//                        room.getUserIdentifier().equals(userId))
//                .findFirst();
//        if (existing.isPresent()) {
//            return existing.get();
//        } else {
//            // 회원 채팅룸은 고정된 userId를 roomId로 사용 (삭제 후 재생성)
//            long newRoomId = userId;
//            ChatRoom newRoom = ChatRoom.builder()
//                    .roomId(newRoomId)
//                    .userType("USER")
//                    .userIdentifier(userId)
//                    .lastActivityTime(LocalDateTime.now())
//                    .build();
//            chatRoomRepository.save(newRoom);
//            return newRoom;
//        }
//    }

    //@Scheduled(cron = "0 0 0/1 * * ?") // 1시간마다 체크
    @Scheduled(cron = "0 */1 * * * *") // 현재는 1분마다 실행
    public void checkAndDeleteOldGuestRooms() {
        LocalDateTime now = LocalDateTime.now();
        List<Long> allRooms = getChatRooms();

        for (Long roomId : allRooms) {
            if (roomId >= 0) continue; // GUEST 채팅만 자동 제거

            List<Message> messages = getMessage(roomId);
            if (!messages.isEmpty()) {
                Message lastMessage = messages.get(messages.size() - 1);
                try {
                    Instant instant = Instant.parse(lastMessage.getTimestamp());
                    LocalDateTime lastMessageTime = instant.atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime();

                    if (Duration.between(lastMessageTime, now).toMinutes() >= 5) {
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

    /// 현재 사용자 정보 반환 ( ADMIN / USER / GUEST),
    @Transactional(readOnly = true)
    public Map<String, Object> getAuthUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Map.of("role", "GUEST");
        }

        String username = auth.getName(); // ex: "kakao_3959737193"
        Optional<Member> opt = memberRepository.findByUsername(username);
        if (opt.isEmpty()) {
            return Map.of("role", "GUEST");
        }
        Member member = opt.get();
        if ("ADMIN".equalsIgnoreCase(String.valueOf(member.getRole()))) {
            return Map.of("role", "ADMIN");
        } else {
            String userApiKey = member.getApiKey();
            String temp = userApiKey.startsWith("kakao_")
                    ? userApiKey.substring("kakao_".length())
                    : userApiKey;
            long userId = Long.parseLong(temp);

            return Map.of(
                    "userId", userId,
                    "role", "USER"
            );
        }
    }
}