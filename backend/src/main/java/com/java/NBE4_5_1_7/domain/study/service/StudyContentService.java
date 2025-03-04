package com.java.NBE4_5_1_7.domain.study.service;

import com.java.NBE4_5_1_7.domain.study.entity.FirstCategory;
import com.java.NBE4_5_1_7.domain.study.repository.StudyContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
