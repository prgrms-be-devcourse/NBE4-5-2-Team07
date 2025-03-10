package com.java.NBE4_5_1_7.domain.community.controller;

import com.java.NBE4_5_1_7.domain.community.post.dto.AddPostRequestDto;
import com.java.NBE4_5_1_7.domain.community.post.dto.PostResponseDto;
import com.java.NBE4_5_1_7.domain.community.post.service.PostService;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/community")
public class CommunityController {
    private final PostService postService;
    private final MemberService memberService;

    @PostMapping("/article/post")
    public ResponseEntity<PostResponseDto> articlePost(AddPostRequestDto postRequestDto) {
        return ResponseEntity.ok(postService.addPost(memberService.getIdFromRq(), postRequestDto));
    }
}
