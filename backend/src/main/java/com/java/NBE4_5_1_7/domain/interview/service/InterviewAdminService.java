package com.java.NBE4_5_1_7.domain.interview.service;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewCategory;
import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContent;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.response.InterviewContentAdminResponseDto;
import com.java.NBE4_5_1_7.domain.interview.repository.InterviewContentAdminRepository;
import com.java.NBE4_5_1_7.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewAdminService {

    private final InterviewContentAdminRepository interviewContentAdminRepository;

    // 카테고리별 키워드 목록 조회
    public Map<String, List<String>> getCategoryKeywords() {
        Map<String, List<String>> categoryKeywords = new HashMap<>();
        List<InterviewCategory> categories = interviewContentAdminRepository.findUniqueCategories();

        if (categories.isEmpty()) {
            throw new ServiceException("404", "등록된 면접 질문 카테고리가 없습니다.");
        }

        for (InterviewCategory category : categories) {
            String categoryName = category.name();
            List<String> keywords = interviewContentAdminRepository.findUniqueKeywordsByCategory(category);
            categoryKeywords.put(categoryName, keywords);
        }

        return categoryKeywords;
    }

    // 특정 카테고리의 모든 면접 질문 조회
    public List<InterviewContentAdminResponseDto> getInterviewsByCategory(InterviewCategory category) {
        List<InterviewContent> contents = interviewContentAdminRepository.findByCategory(category);

        if (contents.isEmpty()) {
            throw new ServiceException("404", "해당 카테고리에 속하는 면접 질문이 없습니다.");
        }

        return contents.stream()
                .map(content -> {
                    Long likeCount = interviewContentAdminRepository.countLikesByInterviewContentId(content.getInterview_content_id());
                    return new InterviewContentAdminResponseDto(content, likeCount);
                })
                .collect(Collectors.toList());
    }

    // 특정 카테고리와 키워드를 포함하는 면접 질문 조회
    public List<InterviewContentAdminResponseDto> getInterviewsByCategoryAndKeyword(InterviewCategory category, String keyword) {
        List<InterviewContent> contents = interviewContentAdminRepository.findByCategoryAndKeyword(category, keyword);

        if (contents.isEmpty()) {
            throw new ServiceException("404", "해당 카테고리와 키워드를 포함하는 면접 질문이 없습니다.");
        }

        return contents.stream()
                .map(content -> {
                    Long likeCount = interviewContentAdminRepository.countLikesByInterviewContentId(content.getInterview_content_id());
                    return new InterviewContentAdminResponseDto(content, likeCount);
                })
                .collect(Collectors.toList());
    }

    // 특정 면접 질문 ID 조회
    public InterviewContentAdminResponseDto getInterviewContentById(Long interviewContentId) {
        InterviewContent content = interviewContentAdminRepository.findById(interviewContentId)
                .orElseThrow(() -> new ServiceException("404", "해당 ID의 면접 질문을 찾을 수 없습니다."));
        Long likeCount = interviewContentAdminRepository.countLikesByInterviewContentId(content.getInterview_content_id());
        return new InterviewContentAdminResponseDto(content, likeCount);
    }
}
