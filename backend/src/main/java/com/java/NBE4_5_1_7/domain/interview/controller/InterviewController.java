package com.java.NBE4_5_1_7.domain.interview.controller;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewCategory;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.request.KeywordContentRequestDto;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.request.RandomRequestDto;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.response.InterviewResponseDto;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.response.RandomResponseDto;
import com.java.NBE4_5_1_7.domain.interview.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @PostMapping("/random/{id}")
    public ResponseEntity<RandomResponseDto> randomContent(@PathVariable("id") Long id, @RequestBody RandomRequestDto randomRequestDto) {
        return ResponseEntity.ok(service.showRandomInterviewContent(randomRequestDto, id));
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
}
