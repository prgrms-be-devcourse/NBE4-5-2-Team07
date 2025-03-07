package com.java.NBE4_5_1_7.domain.study.service;

import com.java.NBE4_5_1_7.domain.study.dto.StudyContentDetailDto;
import com.java.NBE4_5_1_7.domain.study.entity.FirstCategory;
import com.java.NBE4_5_1_7.domain.study.entity.StudyContent;
import com.java.NBE4_5_1_7.domain.study.repository.StudyContentRepository;
import com.java.NBE4_5_1_7.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyContentAdminService {

    private final StudyContentRepository studyContentRepository;

    // 첫 번째 카테고리 목록 조회 (Enum 이름을 한글로 변환하지 않고 그대로 반환)
    public List<String> getFirstCategoryKeys() {
        List<FirstCategory> firstCategories = studyContentRepository.findDistinctFirstCategories();

        if (firstCategories.isEmpty()) {
            throw new ServiceException("404", "등록된 학습 콘텐츠 카테고리가 없습니다.");
        }

        return firstCategories.stream()
                .map(FirstCategory::name)
                .collect(Collectors.toList());
    }

    // 특정 카테고리에 대한 학습 콘텐츠 조회
    public Page<StudyContentDetailDto> getPagedStudyContentsByCategory(String firstCategory, Pageable pageable) {
        FirstCategory category;
        try {
            category = FirstCategory.fromString(firstCategory);
        } catch (IllegalArgumentException e) {
            throw new ServiceException("400", "올바르지 않은 카테고리 값입니다: " + firstCategory);
        }

        Page<StudyContent> studyContents = studyContentRepository.findByFirstCategory(category, pageable);

        if (studyContents.isEmpty()) {
            throw new ServiceException("404", "해당 카테고리에 학습 콘텐츠가 존재하지 않습니다.");
        }

        return studyContents.map(StudyContentDetailDto::new);
    }

    // 특정 학습 콘텐츠 조회 (ID 기반)
    public StudyContentDetailDto getStudyContentById(Long studyContentId) {
        StudyContent studyContent = studyContentRepository.findById(studyContentId)
                .orElseThrow(() -> new ServiceException("404", "해당 학습 콘텐츠를 찾을 수 없습니다."));
        return new StudyContentDetailDto(studyContent);
    }

    // 학습 콘텐츠 수정
    @Transactional
    public void updateStudyContent(Long studyContentId, String updateContent) {
        StudyContent studyContent = studyContentRepository.findById(studyContentId)
                .orElseThrow(() -> new ServiceException("404", "해당 학습 콘텐츠를 찾을 수 없습니다."));

        if (updateContent == null || updateContent.trim().isEmpty()) {
            throw new ServiceException("400", "수정할 내용이 비어 있습니다.");
        }

        studyContent.setBody(updateContent);
    }
    
    // 학습 콘텐츠 삭제
    @Transactional
    public void deleteStudyContent(Long studyContentId) {
        if (!studyContentRepository.existsById(studyContentId)) {
            throw new ServiceException("404", "해당 학습 콘텐츠를 찾을 수 없습니다.");
        }
        studyContentRepository.deleteById(studyContentId);
    }
}
