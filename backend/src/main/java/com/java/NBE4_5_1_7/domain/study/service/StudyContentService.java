package com.java.NBE4_5_1_7.domain.study.service;

import com.java.NBE4_5_1_7.domain.study.dto.StudyContentDetailDto;
import com.java.NBE4_5_1_7.domain.study.entity.FirstCategory;
import com.java.NBE4_5_1_7.domain.study.entity.StudyContent;
import com.java.NBE4_5_1_7.domain.study.repository.StudyContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyContentService {
    private final StudyContentRepository studyContentRepository;

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

    public List<StudyContentDetailDto> getStudyContentByCategory(String firstCategory, String secondCategory) {
        FirstCategory category = FirstCategory.valueOf(firstCategory);
        List<StudyContent> studyContents = studyContentRepository.findByFirstCategoryAndSecondCategory(category, secondCategory);
        return studyContents.stream()
                .map(StudyContentDetailDto::new)
                .toList();
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