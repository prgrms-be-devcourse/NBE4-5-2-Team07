package com.java.NBE4_5_1_7.domain.study.controller;

import com.java.NBE4_5_1_7.domain.study.dto.StudyContentDetailDto;
import com.java.NBE4_5_1_7.domain.study.dto.request.StudyContentUpdateRequestDto;
import com.java.NBE4_5_1_7.domain.study.service.StudyContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    // 다건 조회
    @GetMapping("/{firstCategory}/{secondCategory}")
    public ResponseEntity<Page<StudyContentDetailDto>> getStudyContentByCategory(
            @PathVariable String firstCategory,
            @PathVariable String secondCategory,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size) {

        Page<StudyContentDetailDto> studyContents = studyContentService
                .getStudyContentsByCategory(firstCategory, secondCategory, PageRequest.of(page, size));

        return ResponseEntity.ok(studyContents);
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
