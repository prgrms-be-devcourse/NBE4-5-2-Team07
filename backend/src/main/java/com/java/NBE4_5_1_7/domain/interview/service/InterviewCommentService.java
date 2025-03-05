package com.java.NBE4_5_1_7.domain.interview.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContent;
import com.java.NBE4_5_1_7.domain.interview.repository.InterviewContentRepository;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.request.InterviewCommentDetailDto;
import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContentComment;
import com.java.NBE4_5_1_7.domain.interview.repository.InterviewCommentRepository;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.repository.MemberRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewCommentService {

	private final InterviewCommentRepository interviewCommentRepository;
	private final InterviewContentRepository interviewContentRepository;
	private final MemberRepository memberRepository;

	@Transactional
	public InterviewCommentDetailDto createComment(InterviewCommentDetailDto newDto) {
		InterviewContentComment newComment = new InterviewContentComment();

		newComment.setAnswer(newDto.getComment());
		newComment.setPublic(newDto.isPublic());

		InterviewContent interviewContent = interviewContentRepository.findById(newDto.getInterviewContentId())
			.orElseThrow(() -> new RuntimeException("해당 인터뷰 콘텐츠를 찾을 수 없습니다."));
		newComment.setInterviewContent(interviewContent);

		Member member = memberRepository.findById(newDto.getMemberId())
			.orElseThrow(() -> new RuntimeException("해당 사용자를 찾을 수 없습니다."));
		newComment.setMember(member);

		InterviewContentComment savedComment = interviewCommentRepository.save(newComment);

		return new InterviewCommentDetailDto(
			savedComment.getComment_id(),
			savedComment.getAnswer(),
			savedComment.isPublic(),
			savedComment.getInterviewContent().getInterview_content_id(),
			savedComment.getMember().getId()
		);
	}

	public List<InterviewCommentDetailDto> getAllComments() {
		List<InterviewContentComment> comments = interviewCommentRepository.findAll();
		return comments.stream()
			.map(comment -> new InterviewCommentDetailDto(
				comment.getComment_id(),
				comment.getAnswer(),
				comment.isPublic(),
				comment.getInterviewContent().getInterview_content_id(),
				comment.getMember().getId()
			))
			.collect(Collectors.toList());
	}

	public InterviewCommentDetailDto getCommentById(Long commentId) {
		InterviewContentComment comment = interviewCommentRepository.findById(commentId)
			.orElseThrow(() -> new RuntimeException("해당 댓글을 찾을 수 없습니다."));
		return new InterviewCommentDetailDto(
			comment.getComment_id(),
			comment.getAnswer(),
			comment.isPublic(),
			comment.getInterviewContent().getInterview_content_id(),
			comment.getMember().getId()
			);
	}

	@Transactional
	public InterviewCommentDetailDto updateComment(Long commentId, InterviewCommentDetailDto updatedDto) {
		InterviewContentComment comment = interviewCommentRepository.findById(commentId)
			.orElseThrow(() -> new RuntimeException("해당 댓글을 찾을 수 없습니다."));

		comment.setAnswer(updatedDto.getComment());
		comment.setPublic(updatedDto.isPublic());

		return new InterviewCommentDetailDto(
			comment.getComment_id(),
			comment.getAnswer(),
			comment.isPublic(),
			comment.getInterviewContent().getInterview_content_id(),
			comment.getMember().getId()
			);
	}

	public void deleteComment(Long commentId) {
		if (!interviewCommentRepository.existsById(commentId)) {
			throw new RuntimeException("해당 댓글을 찾을 수 없습니다.");
		}
		interviewCommentRepository.deleteById(commentId);
	}
}

