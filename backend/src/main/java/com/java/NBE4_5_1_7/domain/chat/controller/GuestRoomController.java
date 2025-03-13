package com.java.NBE4_5_1_7.domain.chat.controller;

import com.java.NBE4_5_1_7.domain.chat.model.ChatRoom;
import com.java.NBE4_5_1_7.domain.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashSet;
import java.util.Set;

@RestController
@RequiredArgsConstructor
public class GuestRoomController {

    private final ChatRoomRepository chatRoomRepository;

    /// 게스트 채팅룸 ID 할당
    @GetMapping("/chat/room/guest")
    public GuestIdResponse getGuestRoomId() {
        Iterable<ChatRoom> rooms = chatRoomRepository.findAll();
        Set<Long> usedGuestIds = new HashSet<>();
        for (ChatRoom room : rooms) {
            if (room != null && room.getRoomId() < 0) {
                usedGuestIds.add(room.getRoomId());
            }
        }
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
