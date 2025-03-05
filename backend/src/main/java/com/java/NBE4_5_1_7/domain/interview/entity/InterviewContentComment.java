package com.java.NBE4_5_1_7.domain.interview.entity;

import com.java.NBE4_5_1_7.domain.member.entity.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class InterviewContentComment {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long comment_id;

	@Lob
	private String answer;

	@Column(name = "is_public")
	private boolean isPublic;

	@ManyToOne
	@JoinColumn(name = "interview_content_id", nullable = false)
	private InterviewContent interviewContent;

	@ManyToOne
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;

}
