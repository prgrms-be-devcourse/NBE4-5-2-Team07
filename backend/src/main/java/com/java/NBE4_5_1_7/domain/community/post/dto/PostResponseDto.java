package com.java.NBE4_5_1_7.domain.community.post.dto;

import com.java.NBE4_5_1_7.domain.community.comment.dto.CommentResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostResponseDto {
    private Long id;
    private String authorName;
    private LocalDateTime postTime;
    private String title;
    private String content;
    private Integer like;
    private List<CommentResponseDto> comments;
}
