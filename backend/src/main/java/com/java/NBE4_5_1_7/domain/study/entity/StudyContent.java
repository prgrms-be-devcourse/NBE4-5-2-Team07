package com.java.NBE4_5_1_7.domain.study.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class StudyContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long study_content_id;

    @Column(name = "first_category")
    @Enumerated(EnumType.STRING)
    private FirstCategory firstCategory;

    @Column(name = "second_category")
    private String secondCategory;

    private String title;

    @Lob
    @Column(name = "body", columnDefinition = "TEXT")
    private String body;
}
