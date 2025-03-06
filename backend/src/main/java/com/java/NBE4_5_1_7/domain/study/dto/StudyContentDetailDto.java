package com.java.NBE4_5_1_7.domain.study.dto;

import com.java.NBE4_5_1_7.domain.study.entity.StudyContent;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class StudyContentDetailDto {
    private Long id;
    private String title;
    private String body;
    private String firstCategory;
    private String secondCategory;

    public StudyContentDetailDto(StudyContent studyContent) {
        this.id = studyContent.getStudy_content_id();
        this.title = studyContent.getTitle();
        this.body = studyContent.getBody();
        this.firstCategory = studyContent.getFirstCategory().name();
        this.secondCategory = studyContent.getSecondCategory();
    }
}
