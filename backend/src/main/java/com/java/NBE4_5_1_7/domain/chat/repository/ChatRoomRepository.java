package com.java.NBE4_5_1_7.domain.chat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.java.NBE4_5_1_7.domain.chat.entity.ChatRoom;
import com.java.NBE4_5_1_7.domain.member.entity.Member;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
	List<ChatRoom> findByMember(Member member);
}
