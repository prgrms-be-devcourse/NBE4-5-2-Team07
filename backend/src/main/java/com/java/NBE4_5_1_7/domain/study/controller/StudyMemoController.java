package com.java.NBE4_5_1_7.domain.study.controller;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.domain.study.dto.request.StudyMemoCreateRequestDto;
import com.java.NBE4_5_1_7.domain.study.dto.request.StudyMemoRequestDto;
import com.java.NBE4_5_1_7.domain.study.dto.response.StudyMemoResponseDto;
import com.java.NBE4_5_1_7.domain.study.entity.FirstCategory;
import com.java.NBE4_5_1_7.domain.study.entity.StudyContent;
import com.java.NBE4_5_1_7.domain.study.service.StudyContentService;
import com.java.NBE4_5_1_7.domain.study.service.StudyMemoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/studyMemo")
@RequiredArgsConstructor
public class StudyMemoController {
    private final StudyMemoService studyMemoService;
    private final StudyContentService studyContentService;
    private final MemberService memberService;

    /// 메모 생성
    @PostMapping("/create/{studyContentId}")
    public ResponseEntity<String> createStudyMemo(
            @RequestBody StudyMemoCreateRequestDto requestDto,
            @PathVariable Long studyContentId) {
        System.out.println(requestDto.isPublished());
        studyMemoService.createStudyMemo(requestDto, studyContentId);
        return ResponseEntity.ok("create success");
    }

    /// 학습 컨텐츠에 대한 나의 메모 조회
    @GetMapping("/{studyContentId}")
    public ResponseEntity<StudyMemoResponseDto> getStudyMemoByMemberAndStudyContentId(@PathVariable("studyContentId") Long studyContentId) {
        Member member = memberService.getMemberFromRq();
        StudyContent studyContent = studyContentService.findById(studyContentId);
        return ResponseEntity.ok(studyMemoService.getStudyMemoByStudyMemberAndContentId(member, studyContent));
    }

    /// 학습 컨텐츠 별 사용자들의 공개 메모 리스트 반환
    @GetMapping("/list/{studyContentId}")
    public ResponseEntity<List<StudyMemoResponseDto>> getStudyMemoListByMemberAndStudyContentId(@PathVariable Long studyContentId) {
        return ResponseEntity.ok(studyMemoService.getStudyMemoListByStudyContentId(studyContentId));
    }

    /// 사용자 + 카테고리별 메모 및 컨텐츠 조회
    @GetMapping
    public ResponseEntity<List<StudyMemoResponseDto>> getStudyMemosByMemberAndCategory(@RequestParam String category) {
        Member member = memberService.getMemberFromRq();

        FirstCategory categoryEnum = FirstCategory.fromString(category);
        List<StudyMemoResponseDto> studyMemos = studyMemoService.getStudyMemosByMemberAndCategory(member, categoryEnum);
        return ResponseEntity.ok(studyMemos);
    }

    /// 메모 수정
    @PatchMapping("/{studyMemoId}")
    public ResponseEntity<StudyMemoResponseDto> updateStudyMemo(
            @PathVariable Long studyMemoId,
            @RequestBody StudyMemoRequestDto updatedDto) {
        Member member = memberService.getMemberFromRq();

        StudyMemoResponseDto updatedStudyMemo = studyMemoService.updateStudyMemo(studyMemoId, updatedDto, member);
        return ResponseEntity.ok(updatedStudyMemo);
    }

    /// 메모 삭제
    @DeleteMapping("/{studyMemoId}")
    public ResponseEntity<String> deleteStudyMemo(@PathVariable Long studyMemoId) {
        Member member = memberService.getMemberFromRq();

        studyMemoService.deleteStudyMemo(studyMemoId, member);
        return ResponseEntity.ok("해당 메모가 삭제되었습니다.");
    }
}
