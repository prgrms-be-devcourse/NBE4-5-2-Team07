package com.java.NBE4_5_1_7.domain.interviewComment.dto.request;

import com.java.NBE4_5_1_7.domain.interviewComment.entity.InterviewContentComment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewCommentRequestDto {
	private String comment;
	private Boolean isPublic;
	private Long interviewContentId;

	public InterviewCommentRequestDto(InterviewContentComment comment) {
		this.interviewContentId = comment.getInterviewContent().getInterview_content_id();
		this.comment = comment.getAnswer();
		this.isPublic = comment.isPublic();
	}
}