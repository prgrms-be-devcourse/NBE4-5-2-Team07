package com.java.NBE4_5_1_7.domain.study.controller;

import com.java.NBE4_5_1_7.domain.study.service.StudyMemoLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/studyMemo/like")
@RequiredArgsConstructor
public class StudyMemoLikeController {
    private final StudyMemoLikeService studyMemoLikeService;

    @PostMapping("/{studyMemoId}")
    public ResponseEntity<String> saveStudyMemoLike(@PathVariable Long studyMemoId) {
        studyMemoLikeService.addLike(studyMemoId);
        return ResponseEntity.ok("좋아요");
    }

    @DeleteMapping("/{studyMemoId}")
    public  ResponseEntity<String> deleteStudyMemoLike(@PathVariable Long studyMemoId) {
        studyMemoLikeService.deleteLike(studyMemoId);
        return ResponseEntity.ok("좋아요 취소");
    }
}
