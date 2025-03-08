package com.java.NBE4_5_1_7.domain.study.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StudyContentUpdateRequestDto {
    private String title;
    private String firstCategory;
    private String secondCategory;
    private String updateContent;
}
