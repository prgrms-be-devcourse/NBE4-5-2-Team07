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
	private Long memoId;
	private String memoContent;

	public StudyMemoRequestDto(StudyMemo memo) {
		this.memoId = memo.getId();
		this.memoContent = memo.getMemoContent();
	}
}