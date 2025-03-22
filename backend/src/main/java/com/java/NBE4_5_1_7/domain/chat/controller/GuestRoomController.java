package com.java.NBE4_5_1_7.domain.chat.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class GuestRoomController {

    private final RedisTemplate<String, ?> redisTemplate;

    /// 게스트 채팅룸 ID 할당
    @GetMapping("/chat/room/guest")
    public GuestIdResponse getGuestRoomId() {
        Set<String> keys = redisTemplate.keys("chat:*");
        Set<Long> usedGuestIds = keys.stream()
                .map(key -> Long.parseLong(key.replace("chat:", "")))
                .filter(id -> id < 0)
                .collect(Collectors.toSet());

        long candidate = -1;
        while (usedGuestIds.contains(candidate)) {
            candidate--;
        }

        return new GuestIdResponse(candidate);
    }

    public static class GuestIdResponse {
        private long guestId;

        public GuestIdResponse(long guestId) {
            this.guestId = guestId;
        }

        public long getGuestId() {
            return guestId;
        }

        public void setGuestId(long guestId) {
            this.guestId = guestId;
        }
    }
}