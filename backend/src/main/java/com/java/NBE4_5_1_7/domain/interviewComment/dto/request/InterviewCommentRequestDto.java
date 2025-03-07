package com.java.NBE4_5_1_7.domain.interviewComment.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

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
	@JsonProperty("isPublic")
	private Boolean isPublic;
	private Long interviewContentId;
}