package com.java.NBE4_5_1_7.domain.interviewComment.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewCategory;
import com.java.NBE4_5_1_7.domain.interviewComment.entity.InterviewContentComment;

import com.java.NBE4_5_1_7.domain.member.entity.Member;

public interface InterviewCommentRepository extends JpaRepository<InterviewContentComment, Long> {
	@Query("SELECT c FROM InterviewContentComment c JOIN c.interviewContent ic " +
		"WHERE c.member = :member AND ic.category = :category")
	List<InterviewContentComment> findByMemberAndInterviewContentCategory(@Param("member") Member member, @Param("category") InterviewCategory category);

	Optional<InterviewContentComment> findById(Long id);

	@Query("select c from InterviewContentComment c where c.interviewContent.interview_content_id = :interviewContentId")
	List<InterviewContentComment> findByInterviewContentId(@Param("interviewContentId") Long interviewContentId);
}

