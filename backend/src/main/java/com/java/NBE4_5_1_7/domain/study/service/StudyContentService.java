package com.java.NBE4_5_1_7.domain.study.service;

import com.java.NBE4_5_1_7.domain.study.dto.StudyContentDetailDto;
import com.java.NBE4_5_1_7.domain.study.entity.FirstCategory;
import com.java.NBE4_5_1_7.domain.study.entity.StudyContent;
import com.java.NBE4_5_1_7.domain.study.repository.StudyContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudyContentService {
    private final StudyContentRepository studyContentRepository;

    public StudyContent findById(Long id) {
        return studyContentRepository.findById(id)
                .orElse(null);
    }

    public Map<String, List<String>> getAllCategory() {
        Map<String, List<String>> categories = new HashMap<>();
        List<FirstCategory> firstCategories = studyContentRepository.findDistinctFirstCategories();
        for (FirstCategory category : firstCategories) {
            String firstCategory = String.valueOf(category);
            List<String> second = getSecondCategoryByFirstCategory(firstCategory);
            categories.put(String.valueOf(firstCategory), second);
        }
        return categories;
    }

    public List<String> getFirstCategory() {
        List<FirstCategory> firstCategories = studyContentRepository.findDistinctFirstCategories();
        return firstCategories.stream()
                .map(FirstCategory::getCategory)
                .toList();
    }

    public List<String> getSecondCategoryByFirstCategory(String firstCategory) {
        FirstCategory category = FirstCategory.valueOf(firstCategory);
        return studyContentRepository.findDistinctBySecondCategory(category);
    }

    // 다건 조회 (페이징 처리 추가)
    public Page<StudyContentDetailDto> getStudyContentsByCategory(String firstCategory, String secondCategory, Pageable pageable) {
        FirstCategory category = FirstCategory.valueOf(firstCategory);
        Page<StudyContent> studyContentsPage = studyContentRepository
                .findByFirstCategoryAndSecondCategory(category, secondCategory, pageable);

        return studyContentsPage.map(StudyContentDetailDto::new);
    }

    @Transactional
    public void updateStudyContent(Long studyContentId, String updateContent) {
        StudyContent studyContent = studyContentRepository.findById(studyContentId).orElse(null);
        studyContent.setBody(updateContent);
    }

    public void deleteStudyContent(Long studyContentId) {
        studyContentRepository.deleteById(studyContentId);
    }
}