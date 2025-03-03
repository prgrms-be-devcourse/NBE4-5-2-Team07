package com.java.NBE4_5_1_7.domain.interview.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class InterviewContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long interview_content_id;

    private Long head_id;

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
}
