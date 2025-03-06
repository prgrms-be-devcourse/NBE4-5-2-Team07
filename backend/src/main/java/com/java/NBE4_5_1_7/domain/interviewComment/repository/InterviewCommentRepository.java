package com.java.NBE4_5_1_7.domain.interviewComment.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.java.NBE4_5_1_7.domain.interviewComment.entity.InterviewContentComment;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InterviewCommentRepository extends JpaRepository<InterviewContentComment, Long> {
	Optional<InterviewContentComment> findById(Long id);

	@Query("select c from InterviewContentComment c where c.interviewContent.interview_content_id = :interviewContentId")
	List<InterviewContentComment> findByInterviewContentId(@Param("interviewContentId") Long interviewContentId);
}

