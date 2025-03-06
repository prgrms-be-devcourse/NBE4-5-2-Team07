package com.java.NBE4_5_1_7.domain.study.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudyMemoResponseDto {
	private Long memoId;
	private String memoContent;
	private Long studyContentId;
	private String firstCategory;
	private String title;
	private String body;
}
