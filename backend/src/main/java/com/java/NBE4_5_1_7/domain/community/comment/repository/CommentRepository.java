package com.java.NBE4_5_1_7.domain.community.comment.repository;

import com.java.NBE4_5_1_7.domain.community.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}
