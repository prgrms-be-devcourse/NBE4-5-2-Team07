package com.java.NBE4_5_1_7.domain.community.comment.entity;

import com.java.NBE4_5_1_7.domain.community.post.entity.Post;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String comment;

    @Column(name = "created_date")
    @CreatedDate
    private LocalDateTime createdDate;

    @Column(name = "modified_date")
    @LastModifiedDate
    private LocalDateTime modifiedDate;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    // 자기 참조 관계 (대댓글)
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Comment parent;

    // 대댓글 리스트 (부모 댓글이 가지고 있는 대댓글들)
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Comment> children;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member author; // 작성자

    public void update(String newComment) {
        this.comment = newComment;
    }
}