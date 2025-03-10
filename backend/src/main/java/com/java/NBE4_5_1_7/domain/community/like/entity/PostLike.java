package com.java.NBE4_5_1_7.domain.community.like.entity;

import com.java.NBE4_5_1_7.domain.community.post.entity.Post;
import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContent;
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
public class PostLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
}