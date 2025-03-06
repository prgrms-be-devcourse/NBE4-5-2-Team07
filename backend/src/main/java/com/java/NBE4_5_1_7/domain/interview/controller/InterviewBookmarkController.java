package com.java.NBE4_5_1_7.domain.interview.controller;

import com.java.NBE4_5_1_7.domain.interview.entity.dto.response.BookmarkResponseDto;
import com.java.NBE4_5_1_7.domain.interview.service.InterviewService;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
