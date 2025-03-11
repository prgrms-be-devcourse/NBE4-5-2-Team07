package com.java.NBE4_5_1_7.domain.community.post.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EditPostRequestDto {
    private Long postId;
    private String title;
    private String content;
}
