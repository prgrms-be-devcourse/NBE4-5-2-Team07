package com.java.NBE4_5_1_7.domain.interview.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.java.NBE4_5_1_7.domain.interview.entity.dto.response.BookmarkResponseDto;
import com.java.NBE4_5_1_7.domain.interview.service.InterviewService;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/interview/bookmark")
public class InterviewBookmarkController {
    private final InterviewService interviewService;
    private final MemberService memberService;

    @PostMapping
    public ResponseEntity<String> bookmarkAdd(@RequestParam("id") Long contentId) {
        Long memberId = memberService.getIdFromRq();
        return ResponseEntity.ok(interviewService.bookmark(memberId, contentId));
    }

    @GetMapping
    public ResponseEntity<List<BookmarkResponseDto>> showBookmarkList() {
        return ResponseEntity.ok(interviewService.showMyBookmark(memberService.getIdFromRq()));
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<String> deleteNote(@PathVariable Long noteId) {
        Member member = memberService.getMemberFromRq();

        interviewService.deleteNote(noteId, member);
        return ResponseEntity.ok("북마크가 삭제되었습니다.");
    }
}
