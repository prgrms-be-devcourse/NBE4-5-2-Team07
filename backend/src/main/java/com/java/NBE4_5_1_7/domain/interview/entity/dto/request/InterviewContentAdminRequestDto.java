package com.java.NBE4_5_1_7.domain.interview.entity.dto.request;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewCategory;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InterviewContentAdminRequestDto {
    private Long headId;
    private Long tailId;
    private boolean isHead;
    private boolean hasTail;
    private String keyword;
    private InterviewCategory category;
    private String question;
    private String modelAnswer;
}