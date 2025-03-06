package com.java.NBE4_5_1_7.domain.interview.repository;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContent;
import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContentBookmark;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookmarkRepository extends JpaRepository<InterviewContentBookmark, Long> {
    boolean existsByMemberAndInterviewContent(Member member, InterviewContent interviewContent);

    InterviewContentBookmark findByMemberAndInterviewContent(Member member, InterviewContent interviewContent);
}
