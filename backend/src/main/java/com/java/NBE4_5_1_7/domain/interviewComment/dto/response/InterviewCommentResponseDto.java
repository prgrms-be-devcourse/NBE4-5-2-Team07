package com.java.NBE4_5_1_7.domain.interviewComment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewCommentResponseDto {
	private Long commentId;
	private String comment;
	private boolean isPublic;
	private Long interviewContentId;
}