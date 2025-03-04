package com.java.NBE4_5_1_7.domain.study.controller;

import com.java.NBE4_5_1_7.domain.study.service.StudyContentService;
import com.java.NBE4_5_1_7.global.dto.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/study")
public class StudyContentController {
    private final StudyContentService studyContentService;

    @GetMapping
    public RsData<List<String>> getStudyContent() {
        return new RsData<>(
                "200-1",
                "첫 번째 카테고리 목록 조회 성공",
                studyContentService.getFirstCategory());
    }

    @GetMapping("/{firstCategory}")
    public RsData<List<String>> getInitialStudyContent(@PathVariable String firstCategory) {
        return new RsData<>("200-1",
                "두 번째 카테고리 목록 조회 성공",
                studyContentService.getSecondCategoryByFirstCategory(firstCategory));
    }
}
