package com.java.NBE4_5_1_7.domain.interview.entity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.query.sql.internal.ParameterRecognizerImpl;

@Data
@AllArgsConstructor
public class InterviewResponseDto {
    private Long id;
    private Long head_id;
    private Long tail_id;
    private String question;
    private String model_answer;
    private String category;
    private String keyword;
    private Long next_id;
}
