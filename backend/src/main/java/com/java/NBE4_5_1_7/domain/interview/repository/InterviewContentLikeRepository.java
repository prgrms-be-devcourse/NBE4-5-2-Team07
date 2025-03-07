package com.java.NBE4_5_1_7.domain.interview.repository;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContent;
import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContentLike;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewContentLikeRepository extends JpaRepository<InterviewContentLike, Long> {
    Optional<InterviewContentLike> findByInterviewContentAndMember(InterviewContent interviewContent, Member member);

    Long countByInterviewContent(InterviewContent interviewContent);

}
