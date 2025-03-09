package com.java.NBE4_5_1_7.domain.interview.service;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewCategory;
import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContent;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.request.InterviewContentAdminRequestDto;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.response.InterviewContentAdminResponseDto;
import com.java.NBE4_5_1_7.domain.interview.repository.InterviewContentAdminRepository;
import com.java.NBE4_5_1_7.global.exception.ServiceException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

    // 주어진 interviewContentId에 해당하는 면접 질문을 조회하고, 관련된 모든 꼬리 질문을 포함하여 반환
    @Transactional
    public List<InterviewContentAdminResponseDto> getInterviewContentWithAllTails(Long interviewContentId) {
        InterviewContent content = interviewContentAdminRepository.findById(interviewContentId)
                .orElseThrow(() -> new ServiceException("404", "해당 ID의 면접 질문을 찾을 수 없습니다."));
        Long likeCount = interviewContentAdminRepository.countLikesByInterviewContentId(content.getInterview_content_id());

        List<InterviewContentAdminResponseDto> relatedQuestions = getTailQuestions(content.getInterview_content_id());

        List<InterviewContentAdminResponseDto> result = new ArrayList<>();
        result.add(new InterviewContentAdminResponseDto(content, likeCount));
        result.addAll(relatedQuestions);
        return result;
    }

    // 주어진 headId를 기준으로 연관된 꼬리 질문들을 조회
    private List<InterviewContentAdminResponseDto> getTailQuestions(Long headId) {
        List<InterviewContent> tails = interviewContentAdminRepository.findRelatedQuestions(headId);

        List<InterviewContentAdminResponseDto> result = new ArrayList<>();
        for (InterviewContent tail : tails) {
            Long likeCount = interviewContentAdminRepository.countLikesByInterviewContentId(tail.getInterview_content_id());
            result.add(new InterviewContentAdminResponseDto(tail, likeCount));

            if (tail.isHasTail()) {
                result.addAll(getTailQuestions(tail.getInterview_content_id()));
            }
        }
        return result;
    }

    // 면접 질문 ID를 기준으로 카테고리, 키워드, 질문, 모범 답안을 수정
    @Transactional
    public InterviewContentAdminResponseDto updateInterviewContent(Long interviewContentId, InterviewContentAdminRequestDto requestDto) {
        InterviewContent content = interviewContentAdminRepository.findById(interviewContentId)
                .orElseThrow(() -> new ServiceException("404", "해당 ID의 면접 질문을 찾을 수 없습니다."));

        content.setCategory(requestDto.getCategory());
        content.setKeyword(requestDto.getKeyword());
        content.setQuestion(requestDto.getQuestion());
        content.setModelAnswer(requestDto.getModelAnswer());

        interviewContentAdminRepository.save(content);

        return new InterviewContentAdminResponseDto(content, 0L);
    }

    // 특정 면접 질문과 모든 꼬리 질문을 삭제
    @Transactional
    public void deleteInterviewContentWithAllTails(Long interviewContentId) {
        InterviewContent content = interviewContentAdminRepository.findById(interviewContentId)
                .orElseThrow(() -> new ServiceException("404", "해당 ID의 면접 질문을 찾을 수 없습니다."));

        List<InterviewContent> relatedQuestions = getTailContents(content.getInterview_content_id());

        // 모든 연관된 질문 삭제
        interviewContentAdminRepository.deleteAll(relatedQuestions);
        interviewContentAdminRepository.delete(content);
    }

    // 주어진 headId를 기준으로 연관된 모든 꼬리 질문들을 조회
    private List<InterviewContent> getTailContents(Long headId) {
        List<InterviewContent> tails = interviewContentAdminRepository.findRelatedQuestions(headId);
        List<InterviewContent> result = new ArrayList<>(tails);

        for (InterviewContent tail : tails) {
            if (tail.isHasTail()) {
                result.addAll(getTailContents(tail.getInterview_content_id()));
            }
        }
        return result;
    }
}
