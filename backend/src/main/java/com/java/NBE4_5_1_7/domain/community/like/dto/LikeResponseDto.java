package com.java.NBE4_5_1_7.domain.community.like.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LikeResponseDto {
    private Long postId;
    private Integer likeCount;
    private String message;
}
