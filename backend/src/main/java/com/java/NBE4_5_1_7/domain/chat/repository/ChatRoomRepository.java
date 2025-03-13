package com.java.NBE4_5_1_7.domain.chat.repository;

import com.java.NBE4_5_1_7.domain.chat.model.ChatRoom;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRoomRepository extends CrudRepository<ChatRoom, Long> {
}
