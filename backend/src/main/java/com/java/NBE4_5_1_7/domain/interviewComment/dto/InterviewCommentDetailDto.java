package com.java.NBE4_5_1_7.domain.interviewComment.dto;

import com.java.NBE4_5_1_7.domain.interviewComment.entity.InterviewContentComment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewCommentDetailDto {
	private Long commentId;
	private String comment;
	private boolean isPublic;
	private Long interviewContentId;
	private Long memberId;

	public InterviewCommentDetailDto(InterviewContentComment comment) {
		this.commentId = comment.getComment_id();
		this.interviewContentId = comment.getInterviewContent().getInterview_content_id();
		this.comment = comment.getAnswer();
		this.isPublic = comment.isPublic();
		this.memberId = comment.getMember().getId();
	}
}