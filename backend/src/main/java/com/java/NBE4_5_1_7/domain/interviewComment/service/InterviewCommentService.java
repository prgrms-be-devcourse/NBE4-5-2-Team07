package com.java.NBE4_5_1_7.domain.interviewComment.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewCategory;
import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContent;
import com.java.NBE4_5_1_7.domain.interview.repository.InterviewContentRepository;
import com.java.NBE4_5_1_7.domain.interviewComment.dto.request.InterviewCommentRequestDto;
import com.java.NBE4_5_1_7.domain.interviewComment.dto.response.InterviewCommentResponseDto;
import com.java.NBE4_5_1_7.domain.interviewComment.entity.InterviewContentComment;
import com.java.NBE4_5_1_7.domain.interviewComment.repository.InterviewCommentRepository;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.global.exception.ServiceException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewCommentService {

	private final InterviewCommentRepository interviewCommentRepository;
	private final InterviewContentRepository interviewContentRepository;

	@Transactional
	public InterviewCommentResponseDto createComment(InterviewCommentRequestDto newDto, Member member) {
		InterviewContent interviewContent = interviewContentRepository.findById(newDto.getInterviewContentId())
			.orElseThrow(() -> new ServiceException("404", "해당 인터뷰 콘텐츠를 찾을 수 없습니다."));

		InterviewContentComment newComment = new InterviewContentComment();
		newComment.setAnswer(newDto.getComment());
		newComment.setPublic(newDto.isPublic());
		newComment.setInterviewContent(interviewContent);
		newComment.setMember(member);

		InterviewContentComment savedComment = interviewCommentRepository.save(newComment);

		String category = savedComment.getInterviewContent().getCategory().getCategory();

		return new InterviewCommentResponseDto(
			savedComment.getComment_id(),
			savedComment.getAnswer(),
			savedComment.isPublic(),
			savedComment.getInterviewContent().getInterview_content_id(),
			savedComment.getInterviewContent().getQuestion(),
			category
		);
	}

	public List<InterviewCommentResponseDto> getCommentsByMemberAndCategory(Member member, InterviewCategory category) {
		List<InterviewContentComment> comments = interviewCommentRepository.findByMemberAndInterviewContentCategory(member, category);

		return comments.stream()
			.map(comment -> new InterviewCommentResponseDto(
				comment.getComment_id(),
				comment.getAnswer(),
				comment.isPublic(),
				comment.getInterviewContent().getInterview_content_id(),
				comment.getInterviewContent().getQuestion(),
				comment.getInterviewContent().getCategory().getCategory()
			))
			.collect(Collectors.toList());
	}

	public InterviewCommentResponseDto getCommentById(Long commentId, Member member) {
		InterviewContentComment comment = interviewCommentRepository.findById(commentId)
			.orElseThrow(() -> new ServiceException("404", "해당 댓글을 찾을 수 없습니다."));

		if (!comment.getMember().equals(member)) {
			throw new ServiceException("403", "본인이 작성한 댓글만 조회할 수 있습니다.");
		}

		String category = comment.getInterviewContent().getCategory().getCategory();

		return new InterviewCommentResponseDto(
			comment.getComment_id(),
			comment.getAnswer(),
			comment.isPublic(),
			comment.getInterviewContent().getInterview_content_id(),
			comment.getInterviewContent().getQuestion(),
			category
			);
	}

	@Transactional
	public InterviewCommentResponseDto updateComment(Long commentId, InterviewCommentRequestDto updatedDto, Member member) {
		InterviewContentComment comment = interviewCommentRepository.findById(commentId)
			.orElseThrow(() -> new ServiceException("404", "해당 댓글을 찾을 수 없습니다."));

		if (!comment.getMember().equals(member)) {
			throw new ServiceException("403", "본인이 작성한 댓글만 수정할 수 있습니다.");
		}

		comment.setAnswer(updatedDto.getComment());
		comment.setPublic(updatedDto.isPublic());

		String category = comment.getInterviewContent().getCategory().getCategory();

		return new InterviewCommentResponseDto(
			comment.getComment_id(),
			comment.getAnswer(),
			comment.isPublic(),
			comment.getInterviewContent().getInterview_content_id(),
			comment.getInterviewContent().getQuestion(),
			category
			);
	}

	public void deleteComment(Long commentId, Member member) {
		InterviewContentComment comment = interviewCommentRepository.findById(commentId)
			.orElseThrow(() -> new ServiceException("404", "댓글을 찾을 수 없습니다."));

		if (!comment.getMember().equals(member)) {
			throw new ServiceException("403", "본인이 작성한 댓글만 삭제할 수 있습니다.");
		}

		interviewCommentRepository.deleteById(commentId);
	}
}

