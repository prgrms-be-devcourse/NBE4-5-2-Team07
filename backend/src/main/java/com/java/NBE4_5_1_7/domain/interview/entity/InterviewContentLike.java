package com.java.NBE4_5_1_7.domain.interview.entity;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InterviewContentLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "interview_content_id", nullable = false)
    private InterviewContent interviewContent;

    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
}
