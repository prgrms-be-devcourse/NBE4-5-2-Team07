package com.java.NBE4_5_1_7.domain.interview.entity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BookmarkResponseDto {
    private Long contentId;
    private String question;
    private String answer;
}
