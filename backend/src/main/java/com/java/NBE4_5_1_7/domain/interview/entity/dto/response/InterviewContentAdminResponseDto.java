package com.java.NBE4_5_1_7.domain.interview.entity.dto.response;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewCategory;
import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContent;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InterviewContentAdminResponseDto {
    private Long id;
    private Long headId;
    private Long tailId;
    private boolean isHead;
    private boolean hasTail;
    private String keyword;
    private InterviewCategory category;
    private String question;
    private String modelAnswer;
    private Long likeCount;

    public InterviewContentAdminResponseDto(InterviewContent content, Long likeCount) {
        this.id = content.getInterview_content_id();
        this.headId = content.getHead_id();
        this.tailId = content.getTail_id();
        this.isHead = content.isHead();
        this.hasTail = content.isHasTail();
        this.keyword = content.getKeyword();
        this.category = content.getCategory();
        this.question = content.getQuestion();
        this.modelAnswer = content.getModelAnswer();
        this.likeCount = likeCount;
    }
}