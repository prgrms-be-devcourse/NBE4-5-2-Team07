package com.java.NBE4_5_1_7.domain.study.controller;

import com.java.NBE4_5_1_7.domain.study.dto.StudyContentDetailDto;
import com.java.NBE4_5_1_7.domain.study.dto.request.StudyContentUpdateRequestDto;
import com.java.NBE4_5_1_7.domain.study.service.StudyContentAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "학습 콘텐츠 관리", description = "관리자용 API")
public class StudyContentAdminController {

    private final StudyContentAdminService studyContentAdminService;

    @Operation(summary = "모든 카테고리 조회", description = "첫 번째 및 두 번째 카테고리 목록을 조회합니다.")
    @GetMapping("/all")
    public ResponseEntity<Map<String, List<String>>> getAllCategory() {
        return ResponseEntity.ok(studyContentAdminService.getAllCategory());
    }

    @Operation(summary = "첫 번째 카테고리별 학습 콘텐츠 조회", description = "지정된 첫 번째 카테고리에 속하는 학습 콘텐츠를 페이징하여 조회합니다.")
    @GetMapping("/category/{firstCategory}")
    public ResponseEntity<Page<StudyContentDetailDto>> getPagedStudyContentsByFirstCategory(
            @PathVariable String firstCategory,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<StudyContentDetailDto> studyContents = studyContentAdminService
                .getPagedStudyContentsByCategory(firstCategory, PageRequest.of(page, size));

        return ResponseEntity.ok(studyContents);
    }

    @Operation(summary = "첫 번째 + 두 번째 카테고리별 학습 콘텐츠 조회", description = "지정된 첫 번째 및 두 번째 카테고리에 속하는 학습 콘텐츠를 페이징하여 조회합니다.")
    @GetMapping("/category/{firstCategory}/{secondCategory}")
    public ResponseEntity<Page<StudyContentDetailDto>> getPagedStudyContentsByCategories(
            @PathVariable String firstCategory,
            @PathVariable String secondCategory,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<StudyContentDetailDto> studyContents = studyContentAdminService
                .getPagedStudyContentsByCategories(firstCategory, secondCategory, PageRequest.of(page, size));

        return ResponseEntity.ok(studyContents);
    }

    @Operation(summary = "학습 콘텐츠 상세 조회", description = "지정된 ID의 학습 콘텐츠 정보를 조회합니다.")
    @GetMapping("/{studyContentId}")
    public ResponseEntity<StudyContentDetailDto> getStudyContentById(@PathVariable Long studyContentId) {
        return ResponseEntity.ok(studyContentAdminService.getStudyContentById(studyContentId));
    }

    @Operation(summary = "학습 콘텐츠 수정", description = "지정된 ID의 학습 콘텐츠를 수정합니다.")
    @PutMapping("/{studyContentId}")
    public ResponseEntity<String> updateStudyContent(
            @PathVariable Long studyContentId,
            @RequestBody StudyContentUpdateRequestDto requestDto) {
        studyContentAdminService.updateStudyContent(studyContentId, requestDto);
        return ResponseEntity.ok("update success");
    }

    @Operation(summary = "학습 콘텐츠 삭제", description = "지정된 ID의 학습 콘텐츠를 삭제합니다.")
    @DeleteMapping("/{studyContentId}")
    public ResponseEntity<String> deleteStudyContent(@PathVariable Long studyContentId) {
        studyContentAdminService.deleteStudyContent(studyContentId);
        return ResponseEntity.ok("delete success");
    }
}