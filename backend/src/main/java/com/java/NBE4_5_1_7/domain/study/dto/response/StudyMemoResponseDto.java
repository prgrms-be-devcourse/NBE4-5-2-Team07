package com.java.NBE4_5_1_7.domain.study.dto.response;

import com.java.NBE4_5_1_7.domain.study.entity.StudyMemo;
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
	private int likeCount;

	public StudyMemoResponseDto(StudyMemo studyMemo, int likeCount) {
		this.memoId = studyMemo.getId();
		this.memoContent = studyMemo.getMemoContent();
		this.studyContentId = studyMemo.getStudyContent().getStudy_content_id();
		this.likeCount = likeCount;
	}
}
