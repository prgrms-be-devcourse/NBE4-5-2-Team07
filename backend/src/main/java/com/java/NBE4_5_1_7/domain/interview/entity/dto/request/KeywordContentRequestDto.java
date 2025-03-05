package com.java.NBE4_5_1_7.domain.interview.entity.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class KeywordContentRequestDto {
    private List<String> keywordList;
}
