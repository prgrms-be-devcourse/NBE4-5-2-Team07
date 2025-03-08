package com.java.NBE4_5_1_7.domain.study.controller;

import com.java.NBE4_5_1_7.domain.study.dto.StudyContentDetailDto;
import com.java.NBE4_5_1_7.domain.study.dto.request.StudyContentUpdateRequestDto;
import com.java.NBE4_5_1_7.domain.study.service.StudyContentAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/study")
@RequiredArgsConstructor
public class StudyContentAdminController {

    private final StudyContentAdminService studyContentAdminService;

    // 모든 카테고리 (첫 번째 카테고리 + 두 번째 카테고리) 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<Map<String, List<String>>> getAllCategory() {
        return ResponseEntity.ok(studyContentAdminService.getAllCategory());
    }

    // 첫 번째 카테고리에 해당하는 학습 콘텐츠 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/category/{firstCategory}")
    public ResponseEntity<Page<StudyContentDetailDto>> getPagedStudyContentsByFirstCategory(@PathVariable String firstCategory, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {

        Page<StudyContentDetailDto> studyContents = studyContentAdminService.getPagedStudyContentsByCategory(firstCategory, PageRequest.of(page, size));

        return ResponseEntity.ok(studyContents);
    }

    // 첫 번째 + 두 번째 카테고리에 해당하는 학습 콘텐츠 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/category/{firstCategory}/{secondCategory}")
    public ResponseEntity<Page<StudyContentDetailDto>> getPagedStudyContentsByCategories(@PathVariable String firstCategory, @PathVariable String secondCategory, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {

        Page<StudyContentDetailDto> studyContents = studyContentAdminService.getPagedStudyContentsByCategories(firstCategory, secondCategory, PageRequest.of(page, size));

        return ResponseEntity.ok(studyContents);
    }

    // 학습 콘텐츠 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{studyContentId}")
    public ResponseEntity<StudyContentDetailDto> getStudyContentById(@PathVariable Long studyContentId) {
        return ResponseEntity.ok(studyContentAdminService.getStudyContentById(studyContentId));
    }

    // 학습 콘텐츠 수정
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{studyContentId}")
    public ResponseEntity<String> updateStudyContent(@PathVariable Long studyContentId, @RequestBody StudyContentUpdateRequestDto requestDto) {
        studyContentAdminService.updateStudyContent(studyContentId, requestDto);
        return ResponseEntity.ok("update success");
    }

    // 학습 콘텐츠 삭제
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{studyContentId}")
    public ResponseEntity<String> deleteStudyContent(@PathVariable Long studyContentId) {
        studyContentAdminService.deleteStudyContent(studyContentId);
        return ResponseEntity.ok("delete success");
    }
}