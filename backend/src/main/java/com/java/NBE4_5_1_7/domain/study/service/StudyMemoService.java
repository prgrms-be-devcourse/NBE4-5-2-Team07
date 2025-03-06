package com.java.NBE4_5_1_7.domain.study.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.study.dto.request.StudyMemoRequestDto;
import com.java.NBE4_5_1_7.domain.study.dto.response.StudyMemoResponseDto;
import com.java.NBE4_5_1_7.domain.study.entity.StudyContent;
import com.java.NBE4_5_1_7.domain.study.entity.StudyMemo;
import com.java.NBE4_5_1_7.domain.study.repository.StudyContentRepository;
import com.java.NBE4_5_1_7.domain.study.repository.StudyMemoRepository;
import com.java.NBE4_5_1_7.global.Rq;
import com.java.NBE4_5_1_7.global.exception.ServiceException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudyMemoService {
    private final StudyMemoRepository studyMemoRepository;
    private final StudyContentRepository studyContentRepository;
    private final Rq rq;

    // 멤버, 학습 컨텐츠 ID, 메모 내용 저장
    public void createStudyMemo(String studyMemoContent, Long studyContentId) {
        Member member = rq.getActor();

        StudyContent studyContent = studyContentRepository.findById(studyContentId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 학습 컨텐츠 입니다."));
        StudyMemo studyMemo = new StudyMemo(studyMemoContent, studyContent, member);

        studyMemoRepository.save(studyMemo);
    }

    // 메모 다건 조회
    public List<StudyMemoResponseDto> getAllStudyMemos(Member member) {
        return studyMemoRepository.findAll().stream()
            .filter(memo -> memo.getMember().equals(member))
            .map(memo -> new StudyMemoResponseDto(
                memo.getStudyContent().getStudy_content_id(), memo.getMemoContent()))
            .collect(Collectors.toList());
    }

    // 메모 단건 조회
    public StudyMemoResponseDto getStudyMemoById(Long studyMemoId, Member member) {
        StudyMemo studyMemo = studyMemoRepository.findById(studyMemoId)
            .orElseThrow(() -> new RuntimeException("해당 메모를 찾을 수 없습니다."));

        if (!studyMemo.getMember().equals(member)) {
            throw new ServiceException("403", "본인이 작성한 메모만 조회할 수 있습니다.");
        }

        return new StudyMemoResponseDto(
            studyMemo.getStudyContent().getStudy_content_id(),
            studyMemo.getMemoContent()
        );
    }

    // 메모 수정
    public StudyMemoResponseDto updateStudyMemo(Long studyMemoId, StudyMemoRequestDto updatedDto, Member member) {
        StudyMemo studyMemo = studyMemoRepository.findById(studyMemoId)
            .orElseThrow(() -> new RuntimeException("해당 메모를 찾을 수 없습니다."));

        if (!studyMemo.getMember().equals(member)) {
            throw new ServiceException("403", "본인이 작성한 메모만 수정할 수 있습니다.");
        }

        studyMemo.setMemoContent(updatedDto.getMemoContent());
        StudyMemo updatedMemo = studyMemoRepository.save(studyMemo);

        return new StudyMemoResponseDto(updatedMemo.getStudyContent().getStudy_content_id(), updatedMemo.getMemoContent());
    }

    // 메모 삭제
    public void deleteStudyMemo(Long studyMemoId, Member member) {
        StudyMemo studyMemo = studyMemoRepository.findById(studyMemoId)
            .orElseThrow(() -> new RuntimeException("해당 메모를 찾을 수 없습니다."));

        if (!studyMemo.getMember().equals(member)) {
            throw new ServiceException("403", "본인이 작성한 댓글만 삭제할 수 있습니다.");
        }

        studyMemoRepository.delete(studyMemo);
    }
}
