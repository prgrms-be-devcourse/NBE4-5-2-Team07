package com.java.NBE4_5_1_7.domain.community.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponseDto {
    private Long articleId;
    private Long commentId;
    private String commentAuthorName;
    private LocalDateTime commentTime;
    private String comment;
    private Integer reCommentCount;
    private boolean myComment;
}
