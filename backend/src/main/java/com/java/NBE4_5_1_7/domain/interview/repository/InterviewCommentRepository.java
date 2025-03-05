package com.java.NBE4_5_1_7.domain.interview.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContentComment;

public interface InterviewCommentRepository extends JpaRepository<InterviewContentComment, Long> {
	Optional<InterviewContentComment> findById(Long id);
}
