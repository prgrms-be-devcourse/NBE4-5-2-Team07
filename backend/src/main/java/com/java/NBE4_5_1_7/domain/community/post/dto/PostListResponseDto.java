package com.java.NBE4_5_1_7.domain.community.post.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostListResponseDto {
    private Long postId;
    private String title;
    private String author;
    private LocalDateTime createdAt;
}
