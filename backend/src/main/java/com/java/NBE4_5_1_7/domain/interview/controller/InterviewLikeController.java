package com.java.NBE4_5_1_7.domain.interview.controller;

import com.java.NBE4_5_1_7.domain.interview.service.InterviewLikeService;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/interview/like")
public class InterviewLikeController {

    private final InterviewLikeService likeService;
    private final MemberService memberService;

    @GetMapping("/all")
    public ResponseEntity<String> likeChange(@PathVariable("id") Long id) {
        return ResponseEntity.ok(likeService.interviewLike(memberService.getIdFromRq(), id));
    }
}
