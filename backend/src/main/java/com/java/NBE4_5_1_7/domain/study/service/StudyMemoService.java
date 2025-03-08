package com.java.NBE4_5_1_7.domain.study.service;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.domain.study.dto.request.StudyMemoCreateRequestDto;
import com.java.NBE4_5_1_7.domain.study.dto.request.StudyMemoRequestDto;
import com.java.NBE4_5_1_7.domain.study.dto.response.StudyMemoResponseDto;
import com.java.NBE4_5_1_7.domain.study.entity.FirstCategory;
import com.java.NBE4_5_1_7.domain.study.entity.StudyContent;
import com.java.NBE4_5_1_7.domain.study.entity.StudyMemo;
import com.java.NBE4_5_1_7.domain.study.repository.StudyContentRepository;
import com.java.NBE4_5_1_7.domain.study.repository.StudyMemoRepository;
import com.java.NBE4_5_1_7.global.exception.ServiceException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyMemoService {
    private final StudyMemoRepository studyMemoRepository;
    private final StudyContentRepository studyContentRepository;
    private final MemberService memberService;

    // 멤버, 학습 컨텐츠 ID, 메모 내용 저장, 중복 작성 시 수정하게끔 변경
    @Transactional
    public void createStudyMemo(StudyMemoCreateRequestDto requestDto, Long studyContentId) {
        Member member = memberService.getMemberFromRq();

        StudyContent studyContent = studyContentRepository.findById(studyContentId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 학습 컨텐츠 입니다."));

        StudyMemo studyMemo = studyMemoRepository.findByMemberAndStudyContent(member, studyContent);

        if (studyMemo == null) {
            studyMemo = new StudyMemo(requestDto.getContent(), studyContent, member, requestDto.isPublished());

        } else {
//            updateStudyMemo(studyMemo.getId(), new StudyMemoRequestDto(studyMemo), member);
            studyMemo.setMemoContent(requestDto.getContent());
            studyMemo.setPublished(requestDto.isPublished());
        }
        studyMemoRepository.save(studyMemo);
    }

    // 메모 단건 조회
    public StudyMemoResponseDto getStudyMemoByStudyMemberAndContentId(Member member, StudyContent studyContentId) {
        StudyMemo studyMemo = studyMemoRepository.findByMemberAndStudyContent(member, studyContentId);
        return new StudyMemoResponseDto(studyMemo);
    }

    public List<StudyMemoResponseDto> getStudyMemosByMemberAndCategory(Member member, FirstCategory category) {
        List<StudyMemo> memos = studyMemoRepository.findByMemberAndStudyContentCategory(member, category);

        return memos.stream()
                .map(memo -> new StudyMemoResponseDto(
                        memo.getId(),
                        memo.getMemoContent(),
                        memo.getStudyContent().getStudy_content_id(),
                        memo.getStudyContent().getFirstCategory().getCategory(),
                        memo.getStudyContent().getTitle(),
                        memo.getStudyContent().getBody()
                ))
                .collect(Collectors.toList());
    }

    public StudyMemoResponseDto updateStudyMemo(Long studyMemoId, StudyMemoRequestDto updatedDto, Member member) {
        StudyMemo studyMemo = studyMemoRepository.findById(studyMemoId)
                .orElseThrow(() -> new RuntimeException("해당 메모를 찾을 수 없습니다."));

        if (!studyMemo.getMember().equals(member)) {
            throw new ServiceException("403", "본인이 작성한 메모만 수정할 수 있습니다.");
        }

        studyMemo.setMemoContent(updatedDto.getMemoContent());
        StudyMemo updatedMemo = studyMemoRepository.save(studyMemo);

        return new StudyMemoResponseDto(
                updatedMemo.getId(),
                updatedMemo.getMemoContent(),
                updatedMemo.getStudyContent().getStudy_content_id(),
                updatedMemo.getStudyContent().getFirstCategory().getCategory(),
                updatedMemo.getStudyContent().getTitle(),
                updatedMemo.getStudyContent().getBody()
        );
    }

    public void deleteStudyMemo(Long studyMemoId, Member member) {
        StudyMemo studyMemo = studyMemoRepository.findById(studyMemoId)
                .orElseThrow(() -> new RuntimeException("해당 메모를 찾을 수 없습니다."));

        if (!studyMemo.getMember().equals(member)) {
            throw new ServiceException("403", "본인이 작성한 댓글만 삭제할 수 있습니다.");
        }

        studyMemoRepository.delete(studyMemo);
    }
}
