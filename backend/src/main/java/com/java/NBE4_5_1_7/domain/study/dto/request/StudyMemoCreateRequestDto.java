package com.java.NBE4_5_1_7.domain.study.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

@Data
@AllArgsConstructor
@Getter
public class StudyMemoCreateRequestDto {
    private String content;
    private boolean isPublished;
}
