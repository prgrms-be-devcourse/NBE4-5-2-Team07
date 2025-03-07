package com.java.NBE4_5_1_7.domain.study.controller;

import com.java.NBE4_5_1_7.domain.study.dto.StudyContentDetailDto;
import com.java.NBE4_5_1_7.domain.study.dto.request.StudyContentUpdateRequestDto;
import com.java.NBE4_5_1_7.domain.study.service.StudyContentAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/study")
@RequiredArgsConstructor
public class StudyContentAdminController {

    private final StudyContentAdminService studyContentAdminService;

    // 첫 번째 카테고리 목록 조회 (Enum 이름을 한글로 변환하지 않고 그대로 반환)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getFirstCategories() {
        return ResponseEntity.ok(studyContentAdminService.getFirstCategoryKeys());
    }

    // 특정 카테고리에 대한 학습 콘텐츠 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<StudyContentDetailDto>> getStudyContentsByFirstCategory(
            @RequestParam String firstCategory) {
        return ResponseEntity.ok(studyContentAdminService.getStudyContentsByFirstCategory(firstCategory));
    }

    // 특정 학습 콘텐츠 조회 (ID 기반)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{studyContentId}")
    public ResponseEntity<StudyContentDetailDto> getStudyContentById(@PathVariable Long studyContentId) {
        return ResponseEntity.ok(studyContentAdminService.getStudyContentById(studyContentId));
    }

    // 학습 콘텐츠 수정
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update/{studyContentId}")
    public ResponseEntity<String> updateStudyContent(
            @PathVariable Long studyContentId,
            @RequestBody StudyContentUpdateRequestDto requestDto) {
        studyContentAdminService.updateStudyContent(studyContentId, requestDto.getUpdateContent());
        return ResponseEntity.ok("update success");
    }

    // 학습 콘텐츠 삭제
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{studyContentId}")
    public ResponseEntity<String> deleteStudyContent(@PathVariable Long studyContentId) {
        studyContentAdminService.deleteStudyContent(studyContentId);
        return ResponseEntity.ok("delete success");
    }
}
