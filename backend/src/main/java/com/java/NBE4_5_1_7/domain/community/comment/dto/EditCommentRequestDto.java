package com.java.NBE4_5_1_7.domain.community.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EditCommentRequestDto {
    private Long commentId;
    private String comment;
}

