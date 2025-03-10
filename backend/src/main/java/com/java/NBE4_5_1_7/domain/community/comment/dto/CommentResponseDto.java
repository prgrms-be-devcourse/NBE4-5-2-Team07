package com.java.NBE4_5_1_7.domain.community.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponseDto {
    private Long articleId;
    private String commentAuthorName;
    private LocalDateTime commentTime;
    private String comment;
}
