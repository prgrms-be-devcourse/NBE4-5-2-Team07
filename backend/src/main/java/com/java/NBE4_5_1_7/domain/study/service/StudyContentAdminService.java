package com.java.NBE4_5_1_7.domain.study.service;

import com.java.NBE4_5_1_7.domain.study.dto.StudyContentDetailDto;
import com.java.NBE4_5_1_7.domain.study.dto.request.StudyContentCreateRequestDto;
import com.java.NBE4_5_1_7.domain.study.dto.request.StudyContentUpdateRequestDto;
import com.java.NBE4_5_1_7.domain.study.entity.FirstCategory;
import com.java.NBE4_5_1_7.domain.study.entity.StudyContent;
import com.java.NBE4_5_1_7.domain.study.repository.StudyContentRepository;
import com.java.NBE4_5_1_7.global.exception.ServiceException;
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
public class StudyContentAdminService {

    private final StudyContentRepository studyContentRepository;

    public Map<String, List<String>> getAllCategory() {
        Map<String, List<String>> categories = new HashMap<>();
        List<FirstCategory> firstCategories = studyContentRepository.findDistinctFirstCategories();

        if (firstCategories.isEmpty()) {
            throw new ServiceException("404", "등록된 학습 콘텐츠 카테고리가 없습니다.");
        }

        for (FirstCategory category : firstCategories) {
            String firstCategory = category.name();
            List<String> secondCategories = studyContentRepository.findDistinctBySecondCategory(category);
            categories.put(firstCategory, secondCategories);
        }
        return categories;
    }

    public Page<StudyContentDetailDto> getPagedStudyContentsByCategory(String firstCategory, Pageable pageable) {
        FirstCategory category;
        try {
            category = FirstCategory.fromString(firstCategory);
        } catch (IllegalArgumentException e) {
            throw new ServiceException("400", "올바르지 않은 첫 번째 카테고리 값입니다: " + firstCategory);
        }

        Page<StudyContent> studyContents = studyContentRepository.findByFirstCategory(category, pageable);

        if (studyContents.isEmpty()) {
            throw new ServiceException("404", "해당 카테고리에 학습 콘텐츠가 존재하지 않습니다.");
        }

        return studyContents.map(StudyContentDetailDto::new);
    }

    public Page<StudyContentDetailDto> getPagedStudyContentsByCategories(String firstCategory, String secondCategory, Pageable pageable) {
        FirstCategory category;
        try {
            category = FirstCategory.fromString(firstCategory);
        } catch (IllegalArgumentException e) {
            throw new ServiceException("400", "올바르지 않은 첫 번째 카테고리 값입니다: " + firstCategory);
        }

        Page<StudyContent> studyContents = studyContentRepository.findByFirstCategoryAndSecondCategory(category, secondCategory, pageable);

        if (studyContents.isEmpty()) {
            throw new ServiceException("404", "해당 카테고리 조합에 학습 콘텐츠가 존재하지 않습니다." + firstCategory + secondCategory);
        }

        return studyContents.map(StudyContentDetailDto::new);
    }

    public StudyContentDetailDto getStudyContentById(Long studyContentId) {
        StudyContent studyContent = studyContentRepository.findById(studyContentId).orElseThrow(() -> new ServiceException("404", "해당 학습 콘텐츠를 찾을 수 없습니다."));
        return new StudyContentDetailDto(studyContent);
    }

    @Transactional
    public void updateStudyContent(Long studyContentId, StudyContentUpdateRequestDto requestDto) {
        StudyContent studyContent = studyContentRepository.findById(studyContentId).orElseThrow(() -> new ServiceException("404", "해당 학습 콘텐츠를 찾을 수 없습니다."));

        if (requestDto.getTitle() != null && !requestDto.getTitle().trim().isEmpty()) {
            studyContent.setTitle(requestDto.getTitle());
        }

        if (requestDto.getFirstCategory() != null && !requestDto.getFirstCategory().trim().isEmpty()) {
            try {
                FirstCategory newCategory = FirstCategory.fromString(requestDto.getFirstCategory());

                List<FirstCategory> existingCategories = studyContentRepository.findDistinctFirstCategories();
                if (!existingCategories.contains(newCategory)) {
                    throw new ServiceException("400", "존재하지 않는 첫 번째 카테고리입니다.");
                }

                studyContent.setFirstCategory(newCategory);
            } catch (IllegalArgumentException e) {
                throw new ServiceException("400", "잘못된 첫 번째 카테고리 값입니다.");
            }
        }

        if (requestDto.getSecondCategory() != null && !requestDto.getSecondCategory().trim().isEmpty()) {
            studyContent.setSecondCategory(requestDto.getSecondCategory());
        }

        if (requestDto.getUpdateContent() != null && !requestDto.getUpdateContent().trim().isEmpty()) {
            studyContent.setBody(requestDto.getUpdateContent());
        }
    }

    @Transactional
    public void deleteStudyContent(Long studyContentId) {
        if (!studyContentRepository.existsById(studyContentId)) {
            throw new ServiceException("404", "해당 학습 콘텐츠를 찾을 수 없습니다.");
        }
        studyContentRepository.deleteById(studyContentId);
    }

    @Transactional
    public StudyContentDetailDto createStudyContent(StudyContentCreateRequestDto requestDto) {
        FirstCategory firstCategory;
        try {
            firstCategory = FirstCategory.fromString(requestDto.getFirstCategory());
        } catch (IllegalArgumentException e) {
            throw new ServiceException("400", "존재하지 않는 첫 번째 카테고리입니다: " + requestDto.getFirstCategory());
        }

        if (requestDto.getSecondCategory() == null || requestDto.getSecondCategory().trim().isEmpty() ||
                requestDto.getTitle() == null || requestDto.getTitle().trim().isEmpty() ||
                requestDto.getBody() == null || requestDto.getBody().trim().isEmpty()) {
            throw new ServiceException("400", "두 번째 카테고리, 제목, 내용은 비워둘 수 없습니다.");
        }

        StudyContent studyContent = new StudyContent();
        studyContent.setFirstCategory(firstCategory);
        studyContent.setSecondCategory(requestDto.getSecondCategory());
        studyContent.setTitle(requestDto.getTitle());
        studyContent.setBody(requestDto.getBody());

        studyContentRepository.save(studyContent);
        return new StudyContentDetailDto(studyContent);
    }
}