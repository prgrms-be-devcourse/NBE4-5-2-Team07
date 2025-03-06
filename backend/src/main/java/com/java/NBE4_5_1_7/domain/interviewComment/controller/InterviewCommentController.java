package com.java.NBE4_5_1_7.domain.interviewComment.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.java.NBE4_5_1_7.domain.interviewComment.dto.request.InterviewCommentRequestDto;
import com.java.NBE4_5_1_7.domain.interviewComment.dto.response.InterviewCommentResponseDto;
import com.java.NBE4_5_1_7.domain.interviewComment.service.InterviewCommentService;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/interview-comments")
public class InterviewCommentController {

	private final InterviewCommentService interviewCommentService;
	private final MemberService memberService;

	@PostMapping
	public ResponseEntity<InterviewCommentResponseDto> createComment(
		@RequestBody InterviewCommentRequestDto newDto) {
		Member member = memberService.getMemberFromRq();

		InterviewCommentResponseDto createdComment = interviewCommentService.createComment(newDto, member);
		return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
	}

	@GetMapping
	public ResponseEntity<List<InterviewCommentResponseDto>> all() {
		Member member = memberService.getMemberFromRq();

		List<InterviewCommentResponseDto> comments = interviewCommentService.getAllComments(member);
		return ResponseEntity.ok(comments);
	}

	@GetMapping("/{commentId}")
	public ResponseEntity<InterviewCommentResponseDto> getCommentById(@PathVariable Long commentId) {
		Member member = memberService.getMemberFromRq();

		InterviewCommentResponseDto comment = interviewCommentService.getCommentById(commentId, member);
		return ResponseEntity.ok(comment);
	}

	@PatchMapping("/{commentId}")
	public ResponseEntity<InterviewCommentResponseDto> updateComment(
		@PathVariable("commentId") Long commentId,
		@RequestBody InterviewCommentRequestDto updatedDto) {
		Member member = memberService.getMemberFromRq();

		InterviewCommentResponseDto updatedComment = interviewCommentService.updateComment(commentId, updatedDto, member);
		return ResponseEntity.ok(updatedComment);
	}

	@DeleteMapping("/{commentId}")
	public ResponseEntity<String> deleteComment(@PathVariable Long commentId) {
		Member member = memberService.getMemberFromRq();

		interviewCommentService.deleteComment(commentId, member);
		return ResponseEntity.ok("답변이 삭제되었습니다.");
	}

	// 내 메모 보기: 해당 질문(interviewContentId)에 대해 현재 사용자가 작성한 메모 조회
	@GetMapping("/my/{interviewContentId}")
	public ResponseEntity<List<InterviewCommentResponseDto>> getMyComments(
			@PathVariable Long interviewContentId) {
		Member member = memberService.getMemberFromRq();
		List<InterviewCommentResponseDto> myComments = interviewCommentService.getMyComments(interviewContentId, member);
		return ResponseEntity.ok(myComments);
	}

	// 다른 사람 메모 보기: 해당 질문(interviewContentId)에 대해 다른 사용자가 작성한 공개 메모 조회
	@GetMapping("/public/{interviewContentId}")
	public ResponseEntity<List<InterviewCommentResponseDto>> getPublicComments(
			@PathVariable Long interviewContentId) {
		Member member = memberService.getMemberFromRq();
		List<InterviewCommentResponseDto> publicComments = interviewCommentService.getPublicComments(interviewContentId, member);
		return ResponseEntity.ok(publicComments);
	}
}