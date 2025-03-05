package com.java.NBE4_5_1_7.domain.study.controller;

import com.java.NBE4_5_1_7.domain.study.dto.StudyContentDetailDto;
import com.java.NBE4_5_1_7.domain.study.dto.request.StudyContentUpdateRequestDto;
import com.java.NBE4_5_1_7.domain.study.entity.FirstCategory;
import com.java.NBE4_5_1_7.domain.study.service.StudyContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/study")
public class StudyContentController {
    private final StudyContentService studyContentService;

    @GetMapping
    public ResponseEntity<List<String>> getFirstCategory() {
        return ResponseEntity.ok(studyContentService.getFirstCategory());
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, List<String>>> getAllCategory() {
        return ResponseEntity.ok(studyContentService.getAllCategory());
    }

    @GetMapping("/{firstCategory}")
    public ResponseEntity<List<String>> getSecondCategory(@PathVariable String firstCategory) {
        return ResponseEntity.ok(studyContentService.getSecondCategoryByFirstCategory(firstCategory));
    }

    @GetMapping("/{firstCategory}/{secondCategory}")
    public ResponseEntity<List<StudyContentDetailDto>> getStudyContents(
            @PathVariable String firstCategory,
            @PathVariable String secondCategory) {
        return ResponseEntity.ok(studyContentService.getStudyContentByCategory(firstCategory, secondCategory));
    }

    @PutMapping("/update/{studyContentId}")
    public ResponseEntity<String> updateStudyContent(
            @PathVariable("studyContentId") Long studyContentId,
            @RequestBody StudyContentUpdateRequestDto requestDto) {
        studyContentService.updateStudyContent(studyContentId, requestDto.getUpdateContent());
        return ResponseEntity.ok("update success");
    }

    @DeleteMapping("/delete/{studyContentId}")
    public ResponseEntity<String> deleteStudyContent(@PathVariable("studyContentId") Long studyContentId) {
        studyContentService.deleteStudyContent(studyContentId);
        return ResponseEntity.ok("delete studyContent");
    }
}
