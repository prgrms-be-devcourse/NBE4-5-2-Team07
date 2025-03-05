package com.java.NBE4_5_1_7.domain.study.controller;

import com.java.NBE4_5_1_7.domain.study.dto.request.StudyMemoCreateRequestDto;
import com.java.NBE4_5_1_7.domain.study.service.StudyMemoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/studyMemo")
@RequiredArgsConstructor
public class StudyMemoController {
    private final StudyMemoService studyMemoService;
    // 메모 생성
    @PostMapping("/create/{studyContentId}")
    public ResponseEntity<String> createStudyMemo(
            @RequestBody StudyMemoCreateRequestDto requestDto,
            @PathVariable Long studyContentId) {
        studyMemoService.createStudyMemo(requestDto.getContent(), studyContentId);
        return ResponseEntity.ok("create success");
    }
}
