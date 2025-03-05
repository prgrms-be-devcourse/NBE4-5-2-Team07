package com.java.NBE4_5_1_7.domain.interview.controller;

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

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewCategory;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.request.InterviewCommentDetailDto;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.request.KeywordContentRequestDto;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.request.RandomRequestDto;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.response.InterviewResponseDto;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.response.RandomResponseDto;
import com.java.NBE4_5_1_7.domain.interview.service.InterviewCommentService;
import com.java.NBE4_5_1_7.domain.interview.service.InterviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/interview")
public class InterviewController {
    private final InterviewService service;

    // 전체 머리 질문 ID
    @GetMapping("/all")
    public ResponseEntity<List<Long>> allHeadContent() {
        return ResponseEntity.ok(service.allHeadQuestion());
    }

    // 카테고리 별 머리 질문 ID
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Long>> categoryContentId(@PathVariable("category") InterviewCategory category) {
        return ResponseEntity.ok(service.categoryHeadQuestion(category));
    }

    // 특정 ID 면접 컨텐츠 단건 조회 -> 다음 면접 컨텐츠 ID 값은 ID 순서대로 제공
    @GetMapping("/{id}")
    public ResponseEntity<InterviewResponseDto> oneContent(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.showOneInterviewContent(id));
    }

    // 특정 ID 면접 컨텐츠 단건 조회 -> 다음 면접 컨텐츠 ID 값은 랜덤하게 제공
    @PostMapping("/random")
    public ResponseEntity<RandomResponseDto> randomContent(@RequestBody RandomRequestDto randomRequestDto) {
        return ResponseEntity.ok(service.showRandomInterviewContent(randomRequestDto));
    }

    // Keyword 리스트 반환
    @GetMapping("/keyword")
    public ResponseEntity<List<String>> showKeywordList() {
        return ResponseEntity.ok(service.showKeywordList());
    }

    // Keyword 포함된 머리 질문들의 ID 값 리스트 반환
    @PostMapping("/keyword/content")
    public ResponseEntity<List<Long>> keywordContentId(@RequestBody KeywordContentRequestDto keywordContentRequestDto) {
        return ResponseEntity.ok(service.keywordHeadQuestion(keywordContentRequestDto));
    }

    @RestController
    @RequiredArgsConstructor
    @RequestMapping("/api/v1/interview-comments")
    public static class InterviewCommentController {

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
}
