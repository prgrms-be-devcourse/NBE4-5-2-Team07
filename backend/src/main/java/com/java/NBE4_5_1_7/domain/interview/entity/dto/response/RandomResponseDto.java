package com.java.NBE4_5_1_7.domain.interview.entity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class RandomResponseDto {
    private List<Long> indexList;
    private InterviewResponseDto interviewResponseDto;
}
