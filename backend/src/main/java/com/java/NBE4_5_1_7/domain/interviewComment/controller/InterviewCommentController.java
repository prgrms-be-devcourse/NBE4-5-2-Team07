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
import org.springframework.web.bind.annotation.RequestParam;
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

	///  댓글 생성
	@PostMapping
	public ResponseEntity<InterviewCommentResponseDto> createComment(
		@RequestBody InterviewCommentRequestDto newDto) {
		Member member = memberService.getMemberFromRq();

		InterviewCommentResponseDto createdComment = interviewCommentService.createComment(newDto, member);
		return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
	}


	/// 사용자 + 카테고리별 댓글 및 컨텐츠 조회
	@GetMapping
	public ResponseEntity<List<InterviewCommentResponseDto>> getCommentsByMemberAndCategory(@RequestParam String category) {
		Member member = memberService.getMemberFromRq();

		List<InterviewCommentResponseDto> comments = interviewCommentService.getCommentsByMemberAndCategory(member, category);
		return ResponseEntity.ok(comments);
	}

	///  댓글 수정
	@PatchMapping("/{commentId}")
	public ResponseEntity<InterviewCommentResponseDto> updateComment(
		@PathVariable("commentId") Long commentId,
		@RequestBody InterviewCommentRequestDto updatedDto) {
		Member member = memberService.getMemberFromRq();

		InterviewCommentResponseDto updatedComment = interviewCommentService.updateComment(commentId, updatedDto, member);
		return ResponseEntity.ok(updatedComment);
	}

	///  댓글 삭제
	@DeleteMapping("/{commentId}")
	public ResponseEntity<String> deleteComment(@PathVariable Long commentId) {
		Member member = memberService.getMemberFromRq();

		interviewCommentService.deleteComment(commentId, member);
		return ResponseEntity.ok("답변이 삭제되었습니다.");
	}
}