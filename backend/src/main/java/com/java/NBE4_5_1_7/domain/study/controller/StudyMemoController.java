package com.java.NBE4_5_1_7.domain.study.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.domain.study.dto.request.StudyMemoRequestDto;
import com.java.NBE4_5_1_7.domain.study.dto.response.StudyMemoResponseDto;
import com.java.NBE4_5_1_7.domain.study.service.StudyMemoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/studyMemo")
@RequiredArgsConstructor
public class StudyMemoController {
    private final StudyMemoService studyMemoService;
    private final MemberService memberService;

    // 메모 생성
    @PostMapping("/create/{studyContentId}")
    public ResponseEntity<String> createStudyMemo(
            @RequestBody String studyMemoContent,
            @PathVariable Long studyContentId) {
        studyMemoService.createStudyMemo(studyMemoContent, studyContentId);
        return ResponseEntity.ok("create success");
    }

    // 메모 다건 조회
    @GetMapping
    public ResponseEntity<List<StudyMemoResponseDto>> getAllStudyMemos() {
        Member member = memberService.getMemberFromRq();

        List<StudyMemoResponseDto> studyMemos = studyMemoService.getAllStudyMemos(member);
        return ResponseEntity.ok(studyMemos);
    }

    // 메모 단건 조회
    @GetMapping("/{studyMemoId}")
    public ResponseEntity<StudyMemoResponseDto> getStudyMemoById(@PathVariable Long studyMemoId) {
        Member member = memberService.getMemberFromRq();

        StudyMemoResponseDto studyMemo = studyMemoService.getStudyMemoById(studyMemoId, member);
        return ResponseEntity.ok(studyMemo);
    }

    // 메모 수정
    @PatchMapping("/{studyMemoId}")
    public ResponseEntity<StudyMemoResponseDto> updateStudyMemo(
        @PathVariable Long studyMemoId,
        @RequestBody StudyMemoRequestDto updatedDto) {
        Member member = memberService.getMemberFromRq();

        StudyMemoResponseDto updatedStudyMemo = studyMemoService.updateStudyMemo(studyMemoId, updatedDto, member);
        return ResponseEntity.ok(updatedStudyMemo);
    }

    // 메모 삭제
    @DeleteMapping("/{studyMemoId}")
    public ResponseEntity<String> deleteStudyMemo(@PathVariable Long studyMemoId) {
        Member member = memberService.getMemberFromRq();

        studyMemoService.deleteStudyMemo(studyMemoId, member);
        return ResponseEntity.ok("해당 메모가 삭제되었습니다.");
    }
}
