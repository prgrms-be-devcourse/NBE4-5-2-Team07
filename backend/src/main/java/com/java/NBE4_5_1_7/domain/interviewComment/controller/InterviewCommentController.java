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

import com.java.NBE4_5_1_7.domain.interviewComment.dto.InterviewCommentDetailDto;
import com.java.NBE4_5_1_7.domain.interviewComment.service.InterviewCommentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/interview-comments")
public class InterviewCommentController {

	private final InterviewCommentService interviewCommentService;

	@PostMapping
	public ResponseEntity<InterviewCommentDetailDto> createComment(
		@RequestBody InterviewCommentDetailDto newDto) {
		InterviewCommentDetailDto createdComment = interviewCommentService.createComment(newDto);
		return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
	}

	@GetMapping
	public ResponseEntity<List<InterviewCommentDetailDto>> all() {
		List<InterviewCommentDetailDto> comments = interviewCommentService.getAllComments();
		return ResponseEntity.ok(comments);
	}

	@GetMapping("/{commentId}")
	public ResponseEntity<InterviewCommentDetailDto> getCommentById(@PathVariable Long commentId) {
		InterviewCommentDetailDto comment = interviewCommentService.getCommentById(commentId);
		return ResponseEntity.ok(comment);
	}

	@PatchMapping("/{commentId}")
	public ResponseEntity<InterviewCommentDetailDto> updateComment(
		@PathVariable("commentId") Long commentId,
		@RequestBody InterviewCommentDetailDto updatedDto) {
		InterviewCommentDetailDto updatedComment = interviewCommentService.updateComment(commentId, updatedDto);
		return ResponseEntity.ok(updatedComment);
	}

	@DeleteMapping("/{commentId}")
	public ResponseEntity<String> deleteComment(@PathVariable Long commentId) {
		interviewCommentService.deleteComment(commentId);
		return ResponseEntity.ok("답변이 삭제되었습니다.");
	}
}