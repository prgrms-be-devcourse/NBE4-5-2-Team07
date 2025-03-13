package com.java.NBE4_5_1_7.domain.news.dto.responseDto;

import lombok.Data;
import lombok.Getter;

import java.util.List;

@Data
@Getter
public class JobResponseDto {
    private int totalCount;
    private List<JobsDetailDto> result;
}
