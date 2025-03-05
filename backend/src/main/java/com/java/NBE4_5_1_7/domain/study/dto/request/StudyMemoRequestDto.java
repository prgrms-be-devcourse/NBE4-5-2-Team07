package com.java.NBE4_5_1_7.domain.study.dto.request;

import com.java.NBE4_5_1_7.domain.study.entity.StudyMemo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudyMemoRequestDto {
	private Long studyContentId;
	private String memoContent;

	public StudyMemoRequestDto(StudyMemo memo) {
		this.studyContentId = memo.getStudyContent().getStudy_content_id();
		this.memoContent = memo.getMemoContent();
	}
}