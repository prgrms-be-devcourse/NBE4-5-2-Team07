package com.java.NBE4_5_1_7.domain.interview.entity;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "interview_content_bookmark")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewContentBookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_content_id")
    private InterviewContent interviewContent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;
}