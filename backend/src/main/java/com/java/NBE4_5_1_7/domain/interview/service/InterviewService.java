package com.java.NBE4_5_1_7.domain.interview.service;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewCategory;
import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContent;
import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContentBookmark;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.request.KeywordContentRequestDto;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.request.RandomRequestDto;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.response.BookmarkResponseDto;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.response.InterviewResponseDto;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.response.RandomResponseDto;
import com.java.NBE4_5_1_7.domain.interview.repository.BookmarkRepository;
import com.java.NBE4_5_1_7.domain.interview.repository.InterviewContentRepository;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional
@RequiredArgsConstructor
public class InterviewService {
    private final InterviewContentRepository interviewRepository;
    private final MemberRepository memberRepository;
    private final BookmarkRepository bookmarkRepository;

    // 1. 면접 컨텐츠 ID -> 면접 컨텐츠 DTO
    public InterviewResponseDto showOneInterviewContent(Long id) {
        InterviewContent interview = interviewRepository.findById(id).orElseThrow(() -> new RuntimeException("해당 면접 컨텐츠를 찾을 수 없습니다."));

        Long nextId;

        try {
            InterviewContent nextInterview = interviewRepository.findById(interview.getInterview_content_id() + 1L).orElseThrow(() -> new RuntimeException("다음 컨텐츠가 없습니다."));
            while (true) {
                if (nextInterview.getHead_id() == null && nextInterview.isHead()) {
                    break;
                }
                nextInterview = interviewRepository.findById(nextInterview.getInterview_content_id() + 1L).orElseThrow(() -> new RuntimeException("다음 컨텐츠가 없습니다."));
            }
            nextId = nextInterview.getInterview_content_id();
        } catch (RuntimeException e) {
            nextId = null;
        }
        return new InterviewResponseDto(
                interview.getInterview_content_id(),
                interview.getHead_id(),
                interview.getTail_id(),
                interview.getQuestion(),
                interview.getModelAnswer(),
                interview.getCategory().toString(),
                interview.getKeyword(),
                nextId
        );
    }

    // 2. 머리질문 순서대로 머리질문의 id 값 list 를 반환.
    public List<Long> allHeadQuestion() {
        return interviewRepository.findInterviewContentIdsByHeadTrueAndHeadIdIsNull();
    }

    //3. 모든 질문에 대해 순서 랜덤하게
    public RandomResponseDto showRandomInterviewContent(RandomRequestDto randomRequestDto) {

        List<Long> headList = randomRequestDto.getIndexList();
        Long randomValue = null;

        int randomIndex = 0;
        if (!headList.isEmpty()) {
            randomIndex = ThreadLocalRandom.current().nextInt(headList.size());
            randomValue = headList.get(randomIndex);
        }

        Long randomId = headList.get(randomIndex);
        headList.remove(randomId);
        InterviewContent interview = interviewRepository.findById(randomId).orElseThrow(() -> new RuntimeException("해당 컨텐츠를 찾을 수 없습니다."));
        return new RandomResponseDto(
                headList,
                new InterviewResponseDto(
                        interview.getInterview_content_id(),
                        interview.getHead_id(),
                        interview.getTail_id(),
                        interview.getQuestion(),
                        interview.getModelAnswer(),
                        interview.getCategory().toString(),
                        interview.getKeyword(),
                        randomValue
                ));
    }

    // 4-1. 특정 카테고리 머리질문 순서대로 머리질문의 id 값 list 를 반환.
    public List<Long> categoryHeadQuestion(InterviewCategory category) {
        return interviewRepository.findInterviewContentIdsByCategoryAndHeadTrueAndHeadIdIsNull(category);
    }

    //4. 특정 카테고리에 대해 질문 반환하기
    public InterviewResponseDto showCategoryInterviewContent(InterviewCategory category, Long id) {
        List<Long> interviewList = interviewRepository.findInterviewContentIdsByCategoryAndHeadTrueAndHeadIdIsNull(category);
        if (!interviewList.contains(id)) {
            throw new RuntimeException("해당 ID 의 컨텐츠는 해당 카테고리에 속하지 않습니다.");
        }

        InterviewContent interview = interviewRepository.findById(id).orElseThrow(() -> new RuntimeException("해당 ID 의 컨텐츠를 찾을 수 없습니다."));
        Long nextId;
        int nowIndex = interviewList.indexOf(id);

        if (nowIndex + 1 == interviewList.size()) {
            nextId = null;
        } else {
            nextId = interviewList.get(nowIndex + 1);
        }

        return new InterviewResponseDto(
                interview.getInterview_content_id(),
                interview.getHead_id(),
                interview.getTail_id(),
                interview.getQuestion(),
                interview.getModelAnswer(),
                interview.getCategory().toString(),
                interview.getKeyword(),
                nextId
        );

    }

    // 키워드 목록 조회
    public List<String> showKeywordList() {
        return interviewRepository.findDistinctCategories();
    }

    // 키워드 들을 받고, 해당 키워드 들의 헤더 질문 ID 리스트 반환
    public List<Long> keywordHeadQuestion(KeywordContentRequestDto keywordContentRequestDto) {
        return interviewRepository.findInterviewKeyword(keywordContentRequestDto.getKeywordList());
    }

    public String bookmark(Long memberId, Long contentId) {
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("해당 멤버를 찾을 수 없습니다."));
        InterviewContent interviewContent = interviewRepository.findById(contentId).orElseThrow(() -> new RuntimeException("해당 컨텐츠를 찾을 수 없습니다."));
        if (bookmarkRepository.existsByMemberAndInterviewContent(member, interviewContent)) {
            InterviewContentBookmark bookmark = bookmarkRepository.findByMemberAndInterviewContent(member, interviewContent);
            member.getBookmarks().remove(bookmark);
            interviewContent.getBookmarks().remove(bookmark);

            // 북마크 삭제
            bookmarkRepository.delete(bookmark);

            return "내 노트에서 삭제하였습니다.";
        }

        InterviewContentBookmark bookmark = InterviewContentBookmark.builder()
                .member(member)
                .interviewContent(interviewContent)
                .build();

        bookmarkRepository.save(bookmark);

        member.getBookmarks().add(bookmark);
        interviewContent.getBookmarks().add(bookmark);

        return "내 노트에 등록하였습니다.";

    }

    public List<BookmarkResponseDto> showMyBookmark(Long memberId) {
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("해당 멤버를 찾을 수 없습니다."));
        List<InterviewContentBookmark> bookmarks = member.getBookmarks();
        List<BookmarkResponseDto> result = new ArrayList<>();

        for (InterviewContentBookmark bookmark : bookmarks) {
            result.add(new BookmarkResponseDto(bookmark.getId(), bookmark.getInterviewContent().getQuestion(), bookmark.getInterviewContent().getModelAnswer()));
        }

        return result;
    }
}
