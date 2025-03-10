package com.java.NBE4_5_1_7.domain.interview.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Data
public class InterviewContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long interview_content_id;

    private Long head_id;

    private Long tail_id;

    @Enumerated(EnumType.STRING)
    private InterviewCategory category;

    private String keyword;

    @Lob
    private String question;

    @Lob
    @Column(name = "model_answer", columnDefinition = "TEXT")
    private String modelAnswer;

    @Column(name = "is_head")
    private boolean head;

    @Column(name = "has_tail")
    private boolean hasTail;

    @OneToMany(mappedBy = "interviewContent", cascade = CascadeType.ALL)
    private List<InterviewContentBookmark> bookmarks = new ArrayList<>();

    public Long getHeadId() {
        return head_id;
    }

    public void disconnectTail() {
        this.tail_id = null;
        this.hasTail = false;
    }
}
