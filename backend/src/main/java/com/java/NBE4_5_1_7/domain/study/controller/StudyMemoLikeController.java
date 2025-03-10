package com.java.NBE4_5_1_7.domain.study.controller;

import com.java.NBE4_5_1_7.domain.study.service.StudyMemoLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/studyMemo/like")
@RequiredArgsConstructor
public class StudyMemoLikeController {
    private final StudyMemoLikeService studyMemoLikeService;

    @PostMapping("/{studyMemoId}")
    public ResponseEntity<String> saveStudyMemoLike(@PathVariable Long studyMemoId) {
        return ResponseEntity.ok(studyMemoLikeService.memoLike(studyMemoId));
    }
}
